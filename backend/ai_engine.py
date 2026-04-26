import os
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path
import time

# Look for .env in the current folder OR the parent folder (project root)
env_path = Path('.') / '.env'
if not env_path.exists():
    env_path = Path('..') / '.env'

load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("WARNING: GOOGLE_API_KEY not found in .env")

def generate_insights(product_name: str, reviews: list):
    if not reviews:
        return "No recent reviews found to analyze."
    
    if not api_key:
        return "AI Insight failed: API Key missing."
        
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    prompt = f"""
    Analyze these customer reviews for '{product_name}'.
    1. Sentiment: (Positive/Neutral/Negative)
    2. Main Insight: One high-value business insight for a competitor brand to exploit.
    3. Details: Short bullet points of pain points mentioned by users.
    
    Reviews:
    {chr(10).join(reviews[:5])}
    
    Format exactly as:
    Sentiment: [Value]
    Insights: [Value]
    Details: [Value]
    """
    
    # Try with a small delay for quota
    for attempt in range(2):
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            if "429" in str(e):
                print(f"Quota exceeded for {product_name}, waiting...")
                time.sleep(2)
                continue
            print(f"Gemini Error for {product_name}: {e}")
            return "AI Insight generation failed (API Error)."
            
    return "AI Insight generation failed (Quota exceeded)."

if __name__ == "__main__":
    print(generate_insights("Test Product", ["Good", "Bad"]))
