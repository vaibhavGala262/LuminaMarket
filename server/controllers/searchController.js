import Product from '../models/Product.js';
import { GoogleGenAI } from "@google/genai";
import mongoose from 'mongoose'; // ✅ FIXED: Import mongoose at the top

// Initialize Gemini Client (lazy initialization)
let genAI = null;
let apiKeyInitialized = false;

// ✅ FIXED: Text-based search moved to top so it is defined before aiSearch calls it
export const textSearch = async (req, res) => {
  try {
    // Support both query params and body
    const query = req.query?.query || req.body?.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchRegex = new RegExp(query.trim(), 'i');
    
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ]
    }).lean();

    res.json({
      success: true,
      count: products.length,
      data: products,
      query: query,
      searchType: 'text'
    });
  } catch (error) {
    console.error("Text Search Error:", error);
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message
    });
  }
};

const initializeGemini = () => {
  if (apiKeyInitialized) {
    return genAI;
  }
  
  apiKeyInitialized = true;
  const apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY || '').trim();
  
  if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.length > 0) {
    try {
      // Use v1 API version
      genAI = new GoogleGenAI({ 
        apiKey: apiKey,
        httpOptions: {
          apiVersion: 'v1'
        }
      });
      console.log('✅ Gemini AI initialized successfully');
      console.log('   API Key:', apiKey.substring(0, 10) + '...');
      console.log('   Using API version: v1');
      return genAI;
    } catch (error) {
      console.error("❌ Error initializing Gemini AI:", error);
      return null;
    }
  } else {
    console.log('⚠️  Gemini API key not found or not set. AI search will fallback to text search.');
    console.log('   Set GEMINI_API_KEY in .env file to enable AI search.');
    console.log('   Current API Key value:', apiKey ? `"${apiKey.substring(0, 10)}..."` : 'empty');
    return null;
  }
};

// AI-powered search
export const aiSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Initialize Gemini on first use (ensures dotenv has loaded)
    const ai = initializeGemini();
    
    if (!ai) {
      console.log("⚠️  Gemini API key not found or invalid, falling back to text search");
      return textSearch(req, res);
    }

    // Get all products
    const allProducts = await Product.find({}).lean();

    if (allProducts.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: [],
        query: query
      });
    }

    // Prepare product catalog for AI
    const productCatalog = allProducts.map(p => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price
    }));

    const prompt = `You are an intelligent shopping assistant for an e-commerce store.

User Query: "${query}"

Here is our Product Catalog:
${JSON.stringify(productCatalog, null, 2)}

Task:
Analyze the user's query and the product catalog. 
Return a list of Product IDs that match the user's intent.
- If the user asks for "cheap" or "affordable" items, consider price.
- If the user describes a scenario (e.g., "wedding guest", "beach party"), infer the style and category.
- Match based on description, category, and use case.

Return ONLY a valid JSON object with this exact structure:
{
  "productIds": ["id1", "id2", "id3"]
}

Return the JSON object only, no other text.`;

   
    let parsedResult = null;

    // Use the models API from GoogleGenAI
    try {
      let response;
      try {
      
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });
      } catch (modelError) {
        // ✅ FIXED: Updated to 'gemini-2.5-pro' (Current supported model)
        console.log("⚠️  gemini-2.5-flash failed, trying gemini-2.5-pro...");
        try {
          response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt
          });
        } catch (modelError2) {
          console.log("⚠️  All Gemini models failed, falling back to text search");
          throw modelError2;
        }
      }

      // The response structure may vary, check what we got
      let text = null;
      if (typeof response.text === 'string') {
        text = response.text;
      } else if (response.text && typeof response.text === 'function') {
        text = response.text();
      } else if (response.response && response.response.text) {
        text = typeof response.response.text === 'function' 
          ? response.response.text() 
          : response.response.text;
      } else if (response.candidates && response.candidates[0] && response.candidates[0].content) {
        text = response.candidates[0].content.parts[0].text;
      }

      if (!text) {
        console.log("⚠️  No text in response from Gemini, falling back to text search");
        console.log("Response structure:", JSON.stringify(response, null, 2).substring(0, 200));
        return textSearch(req, res);
      }

      // Parse JSON response
      try {
        // Clean the response text (remove markdown code blocks if present)
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/```\n?/g, '');
        }
        // ✅ FIXED: Assign to the outer parsedResult variable (do not use 'let' here)
        parsedResult = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError);
        console.error("Response text:", text);
        return textSearch(req, res);
      }
    } catch (apiError) {
      console.error("Error calling Gemini API:", apiError);
      console.error("Error details:", apiError.message);
      return textSearch(req, res);
    }

    // ✅ FIXED: logic continues here safely because parsedResult is defined in this scope
    const productIds = parsedResult?.productIds || [];

    if (productIds.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: [],
        query: query,
        message: "No products found matching your query"
      });
    }

    // Convert string IDs to ObjectId for MongoDB query
    // ✅ FIXED: Using top-level mongoose import
    const objectIds = productIds
      .filter(id => mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id));

    if (objectIds.length === 0) {
      console.log("⚠️  No valid product IDs from AI, falling back to text search");
      return textSearch(req, res);
    }

    // Fetch products by IDs
    const products = await Product.find({
      _id: { $in: objectIds }
    }).lean();

    res.json({
      success: true,
      count: products.length,
      data: products,
      query: query
    });

  } catch (error) {
    console.error("AI Search Error:", error);
    console.error("Error details:", error.message);
    // Fallback to text search on error
    return textSearch(req, res);
  }
};