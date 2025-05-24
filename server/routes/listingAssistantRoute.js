const express = require('express');
const { GroqServiceClass } = require('../services/groqService');
const Listing = require('../models/Listing'); // Import the Listing model

const router = express.Router();
const groqService = new GroqServiceClass();

// Define search tools for the AI to use with proper enums matching our database
const searchTools = [
  {
    type: "function",
    function: {
      name: "searchListings",
      description: "Search for listings based on provided criteria",
      parameters: {
        type: "object",
        properties: {
          itemType: {
            type: "string",
            description: "Type or category of item",
            enum: ["Books", "Electronics", "Furniture", "Clothing", "Services", "Other"]
          },
          minPrice: {
            type: "number",
            description: "Minimum price for the listing in dollars"
          },
          maxPrice: {
            type: "number",
            description: "Maximum price for the listing in dollars"
          },
          condition: {
            type: "string",
            description: "Condition of the item",
            enum: ["New", "Like New", "Good", "Fair", "Poor"]
          },
          listingType: {
            type: "string",
            description: "Whether this is an item or service",
            enum: ["item", "service"]
          },
          keywords: {
            type: "array",
            description: "Additional keywords for the search",
            items: {
              type: "string"
            }
          }
        },
        required: []
      }
    }
  }
];

/**
 * Execute the database search based on parameters extracted by the AI
 */
async function executeSearch(searchParams) {
  try {
    // Build MongoDB query
    const query = { status: 'active' }; // Only show active listings
    console.log('Searching with params:', searchParams);
    
    // Handle category (map itemType to category field)
    if (searchParams.itemType) {
      query.category = searchParams.itemType;
    }
    
    // Handle listing type
    if (searchParams.listingType) {
      query.listingType = searchParams.listingType;
    } else {
      // If user is looking for an item type like "laptop", assume listingType = "item"
      if (searchParams.itemType && searchParams.itemType !== "Services") {
        query.listingType = "item";
      }
    }
    
    // Handle price range
    if (searchParams.minPrice !== undefined || searchParams.maxPrice !== undefined) {
      query.price = {};
      if (searchParams.minPrice !== undefined) {
        query.price.$gte = searchParams.minPrice;
      }
      if (searchParams.maxPrice !== undefined) {
        query.price.$lte = searchParams.maxPrice;
      }
    }
    
    // Handle condition - make sure it matches the enum values in your schema
    if (searchParams.condition) {
      // Convert first letter to uppercase to match schema enum
      const formattedCondition = searchParams.condition.charAt(0).toUpperCase() + 
                                searchParams.condition.slice(1).toLowerCase();
      query.condition = formattedCondition;
    }
    
    // Handle keywords (search in title and description using text index)
    if (searchParams.keywords && searchParams.keywords.length > 0) {
      query.$text = { $search: searchParams.keywords.join(' ') };
    }
    
    console.log('Executing query:', JSON.stringify(query));
    
    // Execute query with pagination
    const listings = await Listing.find(query)
      .limit(10)
      .sort({ createdAt: -1 })
      .populate('owner', 'firstName lastName')
      .populate('university', 'name shortName')
      .lean();
    
    console.log(`Found ${listings.length} matching listings`);
    return listings;
  } catch (error) {
    console.error("Error executing listing search:", error);
    throw new Error("Failed to search listings: " + error.message);
  }
}

/**
 * Process the AI response and execute any tool calls
 */
async function processToolCalls(response) {
  try {
    const message = response.choices[0].message;
    let result = {
      answer: message.content || "I'll help you find some listings.",
      executedSearches: [],
      listings: []
    };
    
    // Check if there are tool calls to execute
    if (message.tool_calls && message.tool_calls.length > 0) {
      for (const toolCall of message.tool_calls) {
        if (toolCall.function.name === "searchListings") {
          // Parse the arguments
          const args = JSON.parse(toolCall.function.arguments);
          
          // Log what the AI is searching for
          result.executedSearches.push(args);
          
          // Execute the search
          const listings = await executeSearch(args);
          
          // Add results to our response
          result.listings = result.listings.concat(listings);
          
          // Enhance answer if no results found
          if (listings.length === 0 && !result.answer) {
            result.answer = `I couldn't find any listings matching your criteria. Would you like to try a different search?`;
          } else if (listings.length > 0 && !result.answer) {
            result.answer = `I found ${listings.length} listings that match your criteria!`;
          }
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error processing tool calls:", error);
    throw new Error("Failed to process search request: " + error.message);
  }
}

/**
 * Format listing data for response
 */
function formatListingsForResponse(listings) {
  return listings.map(listing => ({
    _id: listing._id,
    title: listing.title,
    description: listing.description ? 
      (listing.description.length > 100 ? 
        listing.description.substring(0, 100) + '...' : 
        listing.description) : '',
    price: listing.price,
    category: listing.category,
    condition: listing.condition,
    images: listing.images,
    createdAt: listing.createdAt,
    listingType: listing.listingType,
    owner: listing.owner ? {
      name: `${listing.owner.firstName} ${listing.owner.lastName}`,
      id: listing.owner._id
    } : null,
    university: listing.university ? listing.university.name : null
  }));
}

/**
 * POST /chat
 * Chat with the assistant to find listings
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, conversation } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'No message provided'
      });
    }
    
    // Initialize or continue conversation
    const messages = conversation || [];
    
    // Add system message if this is a new conversation
    if (messages.length === 0) {
      messages.push({
        role: "system",
        content: "You are a helpful shopping assistant for a university marketplace called Dorm Deals. " +
                 "Your job is to help students find items they're looking for. " +
                 "The marketplace has categories: Books, Electronics, Furniture, Clothing, Services, and Other. " +
                 "Item conditions can be: New, Like New, Good, Fair, or Poor. " +
                 "When a user describes what they're looking for, extract relevant search criteria " +
                 "and use the searchListings function to find appropriate listings. " +
                 "Be conversational and helpful. If search criteria are ambiguous, ask clarifying questions."
      });
    }
    
    // Add user message
    messages.push({
      role: "user",
      content: message
    });
    
    // Call Groq API with tool definitions
    const response = await groqService.groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      tools: searchTools,
      tool_choice: "auto"
    });
    
    // Process any tool calls
    const result = await processToolCalls(response);
    
    // Format listings for the response
    const formattedListings = formatListingsForResponse(result.listings);
    
    // Add assistant response to conversation history
    messages.push({
      role: "assistant",
      content: response.choices[0].message.content,
      tool_calls: response.choices[0].message.tool_calls
    });
    
    // Return results along with updated conversation
    res.json({
      success: true,
      data: {
        answer: result.answer,
        listings: formattedListings,
        executedSearches: result.executedSearches,
        conversation: messages
      }
    });
    
  } catch (error) {
    console.error('Error in listing assistant chat:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process chat request'
    });
  }
});

/**
 * GET /example
 * Get example of how to use the listing assistant
 */
router.get('/example', (req, res) => {
  res.json({
    endpoint: '/chat',
    method: 'POST',
    contentType: 'application/json',
    requestBody: {
      message: "I'm looking for textbooks under $50 in good condition",
      conversation: [] // Optional - include previous conversation for context
    },
    exampleResponse: {
      success: true,
      data: {
        answer: "I found 3 textbooks under $50 in good condition. They include...",
        listings: [
          {
            _id: "123abc",
            title: "Calculus 101 Textbook",
            price: 35,
            category: "Books",
            condition: "Good",
            images: ["https://example.com/textbook.jpg"],
            createdAt: "2023-05-10T14:30:00Z",
            listingType: "item",
            owner: {
              name: "John Smith",
              id: "user123"
            },
            university: "State University"
          }
        ],
        executedSearches: [
          {
            itemType: "Books",
            maxPrice: 50,
            condition: "Good"
          }
        ],
        conversation: [
          // Updated conversation history
        ]
      }
    }
  });
});

module.exports = router;