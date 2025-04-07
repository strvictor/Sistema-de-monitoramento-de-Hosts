import socket
import ssl
from OpenSSL import crypto

def get_certificate(host, port=443):
    # Cria um contexto SSL padrão e envolve um socket
    context = ssl.create_default_context()
    conn = context.wrap_socket(socket.socket(socket.AF_INET), server_hostname=host)
    conn.settimeout(5)
    conn.connect((host, port))
    
    # Obtém o certificado em formato DER (binário)
    der_cert = conn.getpeercert(binary_form=True)
    conn.close()
    
    # Carrega o certificado usando pyOpenSSL
    cert = crypto.load_certificate(crypto.FILETYPE_ASN1, der_cert)
    return cert
