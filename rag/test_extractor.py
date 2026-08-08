from extractor import extract_document


files = [
    "data/ComputerNetworks.pdf",
    "data/ComputerNetworks.docx",
    "data/ComputerNetworks.txt"
]

for file in files:
    print("\n" + "=" * 50)
    print("FILE:", file)
    print("=" * 50)

    try:
        result = extract_document(file)

        print("Extracted sections:", len(result))

        for item in result[:2]:
            print("\nSource:", item["source"])
            print("Page:", item["page"])
            print("Text:", item["text"][:500])

    except Exception as e:
        print("ERROR:", e)