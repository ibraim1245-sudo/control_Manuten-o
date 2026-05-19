import eel
import json
import os
import sys
from datetime import datetime

if getattr(sys, 'frozen', False):
    base_path = sys._MEIPASS
    data_path = os.path.dirname(sys.executable)
else:
    base_path = os.path.abspath(".")
    data_path = base_path

eel.init(os.path.join(base_path, 'web'))
DB_FILE = os.path.join(data_path, 'banco_dados_v2.json')

if not os.path.exists(DB_FILE):
    with open(DB_FILE, 'w') as f:
        json.dump([], f)

@eel.expose
def salvar_ferramenta(nome, status, prioridade):
    with open(DB_FILE, 'r') as f:
        dados = json.load(f)
    
    nova_ferramenta = {
        "id": datetime.now().strftime("%Y%m%d%H%M%S"),
        "nome": nome,
        "status": status,
        "prioridade": prioridade,
        "data_cadastro": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "historico": [{"data": datetime.now().strftime("%d/%m/%Y %H:%M"), "evento": "Cadastro inicial", "status": status}]
    }
    
    dados.append(nova_ferramenta)
    with open(DB_FILE, 'w') as f:
        json.dump(dados, f, indent=4)
    return True

@eel.expose
def atualizar_status(id_ferramenta, novo_status, observacao):
    with open(DB_FILE, 'r') as f:
        dados = json.load(f)
    
    for f in dados:
        if f['id'] == id_ferramenta:
            f['status'] = novo_status
            f['historico'].append({
                "data": datetime.now().strftime("%d/%m/%Y %H:%M"),
                "evento": observacao,
                "status": novo_status
            })
            break
            
    with open(DB_FILE, 'w') as f:
        json.dump(dados, f, indent=4)
    return True

@eel.expose
def listar_ferramentas():
    with open(DB_FILE, 'r') as f:
        return json.load(f)

@eel.expose
def excluir_ferramenta(id_ferramenta):
    with open(DB_FILE, 'r') as f:
        dados = json.load(f)
    dados = [f for f in dados if f['id'] != id_ferramenta]
    with open(DB_FILE, 'w') as f:
        json.dump(dados, f, indent=4)
    return True

eel.start('index.html', size=(1100, 800))