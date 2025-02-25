import json
import requests

def simulate_gst_upload(gst_json, api_endpoint="http://mock-gst-portal.com/api/gstr1"):
    """
    Simulate uploading GSTR-1 JSON to a mock GST portal or validate it.
    Returns a response indicating success or validation errors.
    """
    try:
        # Mock validation of GSTR-1 JSON (simplified)
        required_fields = ["gstin", "fp", "b2b"]
        for field in required_fields:
            if field not in gst_json:
                return {"status": "error", "message": f"Missing required field: {field}"}

        if not gst_json["b2b"] or not gst_json["b2b"][0]["inv"]:
            return {"status": "error", "message": "No invoices in b2b data"}

        # Mock API call (replace with actual GST portal API if available)
        response = requests.post(api_endpoint, json=gst_json, timeout=10)
        response.raise_for_status()
        return {"status": "success", "message": "GSTR-1 uploaded successfully (mock)", "data": response.json()}
    
    except requests.RequestException as e:
        return {"status": "error", "message": f"API error: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": f"Validation error: {str(e)}"}

# Example usage
if __name__ == "__main__":
    # Mock GSTR-1 JSON (replace with actual gst_json from app.py)
    sample_gst_json = {
        "gstin": "YOUR_GSTIN_HERE",
        "fp": "022025",
        "b2b": [{
            "inv": [{
                "inum": "80XBoEZ0-8BP000",
                "idt": "26-02-2025",
                "val": 15953.44,
                "pos": "07",
                "rchrg": "N",
                "etin": "",
                "inv_typ": "R",
                "itms": [{
                    "num": 1,
                    "itm_det": {
                        "rt": 9.0,
                        "txval": 6868.19,
                        "iamt": 0.0,
                        "camt": 434.52,
                        "samt": 494.52,
                        "csamt": 0.0
                    }
                }, {
                    "num": 2,
                    "itm_det": {
                        "rt": 2.5,
                        "txval": 3858.91,
                        "iamt": 0.0,
                        "camt": 244.20,
                        "samt": 0.0,
                        "csamt": 0.0
                    }
                }, {
                    "num": 3,
                    "itm_det": {
                        "rt": 2.5,
                        "txval": 3858.91,
                        "iamt": 0.0,
                        "camt": 244.20,
                        "samt": 0.0,
                        "csamt": 0.0
                    }
                }]
            }]
        }]
    }
    response = simulate_gst_upload(sample_gst_json)
    print("GST Portal Response:", response)