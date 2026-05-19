import eel
import json
import os
import sys
from datetime import datetime

# Ajuste de caminhos para rodar como .EXE ou Script
if getattr(sys, 'frozen', False):
    base_path = sys._MEIPASS
    data_path = os.path.dirname(sys.executable)
else:
    base_path = os.path.abspath(".")
    data_path = base_path

eel.init(os.path.join(base_path, 'web'))

DB_FILE = os.path.join(data_path, 'banco_mhi.json')

if not os.path.exists(DB_FILE):
    with open(DB_FILE, 'w') as f:
        json.dump([], f)

@eel.expose
def salvar_ferramenta(ferramenta):
    with open(DB_FILE, 'r') as f:
        dados = json.load(f)
    dados.append(ferramenta)
    with open(DB_FILE, 'w') as f:
        json.dump(dados, f, indent=4)
    return True

@eel.expose
def listar_ferramentas():
    with open(DB_FILE, 'r') as f:
        return json.load(f)

@eel.expose
def excluir_ferramenta(index):
    with open(DB_FILE, 'r') as f:
        dados = json.load(f)
    if 0 <= index < len(dados):
        dados.pop(index)
        with open(DB_FILE, 'w') as f:
            json.dump(dados, f, indent=4)
    return True

# REMOVIDO O ARGUMENTO 'title' QUE CAUSOU O ERRO
eel.start('index.html', size=(1150, 800))
