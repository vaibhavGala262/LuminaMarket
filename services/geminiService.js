import { searchAPI } from './api.js';

// This now uses the backend API instead of direct Gemini calls
export const searchProductsWithAI = async (userQuery) => {
  try {
    const response = await searchAPI.aiSearch(userQuery);
    
    if (response.success && response.data) {
      // Return product IDs from the response
      return response.data.map(product => product._id || product.id);
    }
    
    return [];
  } catch (error) {
    console.error("Error in AI search:", error);
    // Fallback to text search
    try {
      const textResponse = await searchAPI.textSearch(userQuery);
      if (textResponse.success && textResponse.data) {
        return textResponse.data.map(product => product._id || product.id);
      }
    } catch (textError) {
      console.error("Text search also failed:", textError);
    }
    
    return [];
  }
};
