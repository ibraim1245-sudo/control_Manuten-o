import eel
import os
import sys

# Descobre o caminho da pasta onde o programa está rodando
if getattr(sys, 'frozen', False):
    # Se estiver rodando como .EXE
    base_path = sys._MEIPASS
else:
    # Se estiver rodando como código Python
    base_path = os.path.dirname(os.path.abspath(__file__))

# Tenta encontrar a pasta 'web'
web_dir = os.path.join(base_path, 'web')

# Se a pasta não existir por algum erro de build, ele usa a pasta atual
if not os.path.exists(web_dir):
    web_dir = base_path

eel.init(web_dir)

@eel.expose
def buscar_dados():
    # Aqui retornamos os dados que aparecem nos gráficos (conforme suas fotos)
    return {
        "ativos": 1,
        "os_abertas": 0,
        "os_concluidas": 4,
        "custo_total": "1.160,00",
        "grafico_status": [0, 0, 0, 4], # Aberta, Andamento, Peças, Concluída
        "grafico_prio": [1, 2, 1] # Crítica, Alta, Média
    }

# Inicia o aplicativo. Se não tiver Chrome, ele usa o Edge automaticamente.
try:
    eel.start('index.html', size=(1366, 768))
except Exception as e:
    print(f"Erro ao iniciar: {e}")
