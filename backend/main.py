from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from io import BytesIO

app = FastAPI(title="DataSleuth AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to DataSleuth AI!",
        "status": "Backend is running"
    }


@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    filename = file.filename.lower()

    try:
        content = await file.read()

        if filename.endswith(".csv"):
            df = pd.read_csv(BytesIO(content))
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(BytesIO(content))
        else:
            raise HTTPException(
                status_code=400,
                detail="Please upload a CSV or Excel file."
            )

        return {
            "filename": file.filename,
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": df.columns.tolist(),
            "missing_values": df.isnull().sum().to_dict(),
            "duplicate_rows": int(df.duplicated().sum()),
            "preview": df.head(5).fillna("").to_dict(orient="records")
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Could not analyse the file: {str(error)}"
        )