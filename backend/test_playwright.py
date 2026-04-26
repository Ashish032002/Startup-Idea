from playwright.sync_api import sync_playwright

def test_scrape():
    try:
        with sync_playwright() as p:
            print("Launching browser...")
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto("https://example.com")
            print("Title:", page.title())
            browser.close()
            print("Success!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_scrape()
