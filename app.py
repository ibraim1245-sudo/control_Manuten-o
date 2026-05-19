import eel
import sqlite3
import os
import sys

# Define local seguro para o Banco de Dados (Pasta AppData do Windows)
app_data = os.path.join(os.environ.get('APPDATA', os.getcwd()), 'ManutencaoMHI')
if not os.path.exists(app_data): os.makedirs(app_data)
DB_PATH = os.path.join(app_data, 'database_mhi.db')

if getattr(sys, 'frozen', False):
    base_path = sys._MEIPASS
else:
    base_path = os.path.abspath(".")

eel.init(os.path.join(base_path, 'web'))

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS ativos (id TEXT PRIMARY KEY, nome TEXT, setor TEXT, cat TEXT, status TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS ordens (id INTEGER PRIMARY KEY, ativo TEXT, titulo TEXT, prioridade TEXT, status TEXT, custo_mo REAL, custo_mat REAL, data TEXT)''')
    conn.commit()
    conn.close()

@eel.expose
def get_stats():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    stats = {
        "total_ativos": c.execute("SELECT COUNT(*) FROM ativos").fetchone()[0],
        "os_abertas": c.execute("SELECT COUNT(*) FROM ordens WHERE status != 'Concluída'").fetchone()[0],
        "custo_total": c.execute("SELECT SUM(custo_mo + custo_mat) FROM ordens").fetchone()[0] or 0,
        "grafico_prio": [
            c.execute("SELECT COUNT(*) FROM ordens WHERE prioridade='Crítica'").fetchone()[0],
            c.execute("SELECT COUNT(*) FROM ordens WHERE prioridade='Alta'").fetchone()[0],
            c.execute("SELECT COUNT(*) FROM ordens WHERE prioridade='Média'").fetchone()[0]
        ]
    }
    conn.close()
    return stats

init_db()
eel.start('index.html', size=(1366, 768))