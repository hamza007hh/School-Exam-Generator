
import requests
import os

# Configuration
API_URL = 'http://localhost:5000/extract'
TEST_PDF_PATH = 'test.pdf' # Check if this exists, or use any sample

def test_extraction():
    print(f"Testing API at: {API_URL}")
    
    # Check if a test file exists, if not create a dummy one or ask user
    if not os.path.exists(TEST_PDF_PATH):
        print(f"Error: {TEST_PDF_PATH} not found. Please place a 'test.pdf' in this directory.")
        return

    try:
        with open(TEST_PDF_PATH, 'rb') as f:
            files = {'file': f}
            print("Sending request...")
            response = requests.post(API_URL, files=files)
            
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'text' in data:
                print("\n--- Success! Extracted Text Preview (First 500 chars) ---")
                print(data['text'][:500])
                print("\n... (end of preview)")
            else:
                print("Response JSON missing 'text' field:", data)
        else:
            print("Request failed:", response.text)
            
    except requests.exceptions.ConnectionError:
        print("\n[ERROR] Could not connect to the server.")
        print("Make sure 'python app.py' is running in a separate terminal!")
    except Exception as e:
        print(f"\n[ERROR] An error occurred: {e}")

if __name__ == "__main__":
    test_extraction()
