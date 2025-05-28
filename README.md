# 🕒 Sistema de Controle de Escalas de Trabalho

Este sistema web permite o cadastro, controle e visualização de escalas de trabalho para funcionários de uma organização. Ideal para prefeituras, instituições públicas e empresas que desejam organizar as jornadas de trabalho de maneira simples e visual.

🔗 **Acesse o sistema:** [https://betinribeiro.github.io/escala_trabalho](https://betinribeiro.github.io/escala_trabalho)

---

## 📌 Funcionalidades

### 👥 Funcionários
- Cadastro completo de funcionários: nome, cargo, matrícula e secretaria/departamento.
- Edição e exclusão com verificação de vínculo com escalas.
- Filtro para facilitar a visualização por funcionário.

### 📅 Escalas de Trabalho
- Registro de escalas com início, fim e descrição.
- Validação de sobreposição de horários.
- Visualização mensal por calendário.
- Cálculo automático de horas trabalhadas por escala.
- Relatórios por funcionário ou por mês.

### 📊 Dashboard
- Exibe resumo mensal: total de horas, quantidade de dias trabalhados por funcionário.
- Calendário interativo com marcações de dias com escalas.
- Modal com detalhes do dia e das escalas vinculadas.

### 📁 Exportação e Importação
- Exporta os dados salvos em `localStorage` para um arquivo `.txt`.
- Permite importar os dados de volta, mantendo a persistência entre sessões ou navegadores.
- Botões dedicados no menu lateral para realizar essas ações com segurança.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** e **CSS3** com **TailwindCSS** para o layout responsivo.
- **JavaScript Puro (Vanilla JS)** para a lógica de funcionamento.
- **Font Awesome** para os ícones.
- Armazenamento local via `localStorage`.

---

## 💾 Como Funciona o Armazenamento

O sistema salva os dados diretamente no navegador do usuário por meio do `localStorage`, garantindo funcionamento offline. As estruturas armazenadas são:

### Funcionários (`employees`)
```json
[
  {
    "id": "abc123",
    "name": "João Silva",
    "position": "Vigilante",
    "registration": "123456",
    "department": "Segurança"
  }
]
