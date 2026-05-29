"""
Servicio Proxy para Consulta de Puntos de Conexión
Usa curl del sistema para evitar problemas SSL con Air-e y Afinia
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import json

app = FastAPI(title="Connection Proxy", version="1.0.0")

API_URLS = {
    "aire": "https://servicios.air-e.com/creg030/WFConsulta.aspx/ListaPuntoConexion",
    "afinia": "https://servicios.energiacaribemar.co/Autogeneracion/WFConsulta.aspx/ListaPuntoConexion",
}

ORIGINS = {
    "aire": "https://servicios.air-e.com",
    "afinia": "https://servicios.energiacaribemar.co",
}

REFERERS = {
    "aire": "https://servicios.air-e.com/creg030/",
    "afinia": "https://servicios.energiacaribemar.co/Autogeneracion/",
}


class PuntoConexionRequest(BaseModel):
    P_CODIGO: str
    empresa: str = "aire"


def build_curl_command(codigo: str, empresa: str) -> list:
    """Construye el comando curl con los parámetros correctos"""
    url = API_URLS.get(empresa, API_URLS["aire"])
    origin = ORIGINS.get(empresa, ORIGINS["aire"])
    referer = REFERERS.get(empresa, REFERERS["aire"])

    body = json.dumps({
        "ObjPuntoConexion": {
            "P_TIPO_CONSULTA": 1,
            "P_CODIGO": codigo
        }
    })

    return [
        "curl",
        "--tlsv1.2",
        "--tls-max", "1.2",
        "-X", "POST",
        url,
        "-H", "Content-Type: application/json; charset=UTF-8",
        "-H", "Accept: application/json, text/javascript, */*; q=0.01",
        "-H", "X-Requested-With: XMLHttpRequest",
        "-H", f"Origin: {origin}",
        "-H", f"Referer: {referer}",
        "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
        "-d", body,
        "--max-time", "30",
        "-s",  # silent
    ]


@app.post("/puntos-conexion")
async def consultar_punto_conexion(request: PuntoConexionRequest):
    """Consulta puntos de conexión en Air-e o Afinia"""
    try:
        cmd = build_curl_command(request.P_CODIGO, request.empresa)

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=35
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"curl error: {result.stderr}"
            )

        # La respuesta puede venir como JSON o como error
        try:
            data = json.loads(result.stdout)
        except json.JSONDecodeError:
            # Si no es JSON válido, puede ser un error HTML
            if "There was an error" in result.stdout or "Error" in result.stdout:
                raise HTTPException(
                    status_code=500,
                    detail=f"API error: {result.stdout[:500]}"
                )
            raise HTTPException(
                status_code=500,
                detail=f"Invalid response: {result.stdout[:500]}"
            )

        return data

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Timeout consultando API externa")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    """Verifica que el servicio esté funcionando"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
