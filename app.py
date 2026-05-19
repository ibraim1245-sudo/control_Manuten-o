import eel
import json
import os
import sys
from datetime import datetime, timedelta

if getattr(sys, 'frozen', False):
    base_path = sys._MEIPASS
    data_path = os.path.dirname(sys.executable)
else:
    base_path = os.path.abspath(".")
    data_path = base_path

eel.init(os.path.join(base_path, 'web'))
DB_FILE = os.path.join(data_path, 'banco_mhi_pro.json')

def load_db():
    if not os.path.exists(DB_FILE):
        initial_data = {"ativos": [], "preventivas": [], "ordens_servico": [], "config": {"sla_alvo": 95}}
        save_db(initial_data)
        return initial_data
    with open(DB_FILE, 'r') as f:
        return json.load(f)

def save_db(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@eel.expose
def get_all_data():
    return load_db()

@eel.expose
def gerenciar_ativo(acao, dados):
    db = load_db()
    if acao == "add":
        dados['id'] = datetime.now().strftime("%Y%m%d%H%M%S")
        dados['data_instalacao'] = datetime.now().strftime("%Y-%m-%d")
        dados['falhas'] = 0
        dados['tempo_reparo_total'] = 0 # em minutos
        dados['tempo_operacao_total'] = 1440 # inicia com 1 dia nominal
        db['ativos'].append(dados)
    save_db(db)
    return True

@eel.expose
def criar_os(dados):
    db = load_db()
    dados['id'] = "OS-" + datetime.now().strftime("%H%M%S")
    dados['abertura'] = datetime.now().strftime("%Y-%m-%d %H:%M")
    dados['status'] = "Aberta"
    db['ordens_servico'].append(dados)
    save_db(db)
    return True

@eel.expose
def encerrar_os(os_id, tempo_reparo):
    db = load_db()
    for os in db['ordens_servico']:
        if os['id'] == os_id:
            os['status'] = "Concluída"
            os['fechamento'] = datetime.now().strftime("%Y-%m-%d %H:%M")
            # Atualiza métricas do ativo vinculado
            for ativo in db['ativos']:
                if ativo['nome'] == os['ativo']:
                    ativo['falhas'] += 1
                    ativo['tempo_reparo_total'] += int(tempo_reparo)
            break
    save_db(db)
    return True

eel.start('index.html', size=(1280, 900))