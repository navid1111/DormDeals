const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GroqServiceClass } = require('../services/groqService'); // Import using CommonJS syntax

const router = express.Router();
const groqService = new GroqServiceClass();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/images';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `image-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|bmp|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

// Helper function to convert local file to base64 data URL
function fileToDataURL(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const mimeType = getMimeType(filePath);
  const base64 = fileBuffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

// Helper function to get MIME type based on file extension
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp'
  };
  return mimeTypes[ext] || 'image/jpeg';
}

// Helper function to parse condition analysis
function parseConditionAnalysis(analysisText) {
  // Extract structured information from the AI response
  const lines = analysisText.split('\n').filter(line => line.trim());
  
  let overallCondition = 'Unknown';
  const specificIssues = [];
  const recommendations = [];
  let confidence = 'Medium';

  // Look for condition keywords
  const conditionKeywords = {
    excellent: ['excellent', 'perfect', 'pristine', 'mint', 'flawless'],
    good: ['good', 'well-maintained', 'decent', 'satisfactory'],
    fair: ['fair', 'average', 'moderate', 'acceptable'],
    poor: ['poor', 'damaged', 'worn', 'deteriorated', 'bad']
  };

  const lowerText = analysisText.toLowerCase();
  for (const [condition, keywords] of Object.entries(conditionKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      overallCondition = condition.charAt(0).toUpperCase() + condition.slice(1);
      break;
    }
  }

  // Extract issues and recommendations (basic parsing)
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('issue') || lowerLine.includes('problem') || lowerLine.includes('damage')) {
      specificIssues.push(line.trim());
    }
    if (lowerLine.includes('recommend') || lowerLine.includes('suggest') || lowerLine.includes('should')) {
      recommendations.push(line.trim());
    }
  });

  // Determine confidence based on response detail
  if (analysisText.length > 500) confidence = 'High';
  else if (analysisText.length < 200) confidence = 'Low';

  return {
    overallCondition,
    specificIssues,
    recommendations,
    confidence
  };
}

/**
 * POST /analyze-image-condition
 * Upload an image and get AI analysis of its condition
 */
router.post('/analyze-image-condition', upload.single('image'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded. Please upload an image file.'
      });
    }

    const { filename, originalname, path: filePath } = req.file;
    
    // Convert file to data URL for vision model
    const imageDataURL = fileToDataURL(filePath);

    // Get analysis type from query parameters or request body
    const analysisType = req.query.type || req.body.type || 'general';
    const customPrompt = req.query.prompt || req.body.prompt;

    // Create detailed prompt for condition analysis
    let prompt = '';
    
    if (customPrompt) {
      prompt = customPrompt;
    } else {
      switch (analysisType) {
        case 'vehicle':
          prompt = `Analyze this vehicle image and provide a detailed condition assessment. Include:
1. Overall condition rating (Excellent/Good/Fair/Poor)
2. Visible damage or wear (scratches, dents, rust, tire condition, etc.)
3. Interior condition (if visible)
4. Maintenance recommendations
5. Estimated condition percentage
Please be specific and thorough in your analysis.`;
          break;
        
        case 'property':
          prompt = `Analyze this property/building image and assess its condition. Include:
1. Overall structural condition
2. Exterior condition (paint, siding, roof, windows, etc.)
3. Any visible damage or maintenance issues
4. Safety concerns if any
5. Maintenance recommendations
6. General upkeep rating
Provide a comprehensive condition report.`;
          break;
        
        case 'product':
          prompt = `Analyze this product image and evaluate its condition. Include:
1. Overall condition rating
2. Signs of wear, damage, or defects
3. Functionality assessment (if determinable from image)
4. Cosmetic condition
5. Estimated remaining lifespan
6. Recommendations for use or maintenance
Be detailed in your assessment.`;
          break;
        
        default:
          prompt = `Analyze this image and provide a comprehensive condition assessment. Include:
1. Overall condition rating (Excellent/Good/Fair/Poor)
2. Detailed description of what you observe
3. Any visible damage, wear, or issues
4. Positive aspects and good condition elements
5. Recommendations for maintenance or improvement
6. Overall assessment summary
Please be thorough and specific in your analysis.`;
      }
    }

    // Call Groq vision model for analysis
    const response = await groqService.analyzeImage(
      imageDataURL,
      prompt,
      'meta-llama/llama-4-maverick-17b-128e-instruct',
      'high' // Use high detail for better condition analysis
    );

    // Extract the analysis text
    const analysisText = groqService.extractTextContent(response);
    
    // Parse the analysis into structured format
    const conditionDetails = parseConditionAnalysis(analysisText);

    // Get analysis metadata
    const analysisMetadata = {
      usedTools: groqService.usedTools(response),
      executedTools: groqService.getExecutedTools(response),
      usage: groqService.getUsageStats(response)
    };

    // Clean up uploaded file after processing (optional)
    // Uncomment the next line if you don't want to keep uploaded files
    // fs.unlinkSync(filePath);

    // Return structured response
    const result = {
      success: true,
      data: {
        filename,
        originalName: originalname,
        condition: analysisText,
        details: conditionDetails,
        analysis: analysisMetadata
      }
    };

    res.json(result);

  } catch (error) {
    console.error('Error analyzing image condition:', error);
    
    // Clean up file if error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze image condition'
    });
  }
});

/**
 * GET /analyze-image-condition/example
 * Get example of how to use the image condition analysis endpoint
 */
router.get('/analyze-image-condition/example', (req, res) => {
  res.json({
    endpoint: '/analyze-image-condition',
    method: 'POST',
    contentType: 'multipart/form-data',
    parameters: {
      image: {
        type: 'file',
        required: true,
        description: 'Image file to analyze (JPEG, PNG, GIF, BMP, WebP)',
        maxSize: '10MB'
      },
      type: {
        type: 'string',
        required: false,
        options: ['general', 'vehicle', 'property', 'product'],
        description: 'Type of condition analysis to perform',
        default: 'general'
      },
      prompt: {
        type: 'string',
        required: false,
        description: 'Custom analysis prompt (overrides type-based prompt)'
      }
    },
    exampleRequest: {
      curl: `curl -X POST http://localhost:3000/analyze-image-condition \\
  -F "image=@/path/to/your/image.jpg" \\
  -F "type=vehicle"`
    },
    exampleResponse: {
      success: true,
      data: {
        filename: 'image-1234567890-123456789.jpg',
        originalName: 'car.jpg',
        condition: 'Full AI analysis text...',
        details: {
          overallCondition: 'Good',
          specificIssues: ['Minor scratch on front bumper'],
          recommendations: ['Regular washing recommended'],
          confidence: 'High'
        },
        analysis: {
          usedTools: false,
          executedTools: [],
          usage: { prompt_tokens: 150, completion_tokens: 300 }
        }
      }
    }
  });
});

module.exports = router; // Export using CommonJS syntax