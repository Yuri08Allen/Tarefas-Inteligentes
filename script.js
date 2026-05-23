const inputTarefa = document.querySelector(".nova-tarefa input");
const botaoAdicionar = document.querySelector(".nova-tarefa button");
const botoesFiltro = document.querySelectorAll(".filtros button");
const listaTarefas = document.querySelector(".lista-tarefas");
const barraProgresso = document.querySelector(".preenchimento");
const textoProgresso = document.querySelector(".progresso p");

const CHAVE_STORAGE = "taskflow-tarefas";

let filtroAtual = "todas";
let tarefas = carregarTarefas();

function criarId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function carregarTarefas() {
  const tarefasSalvas = localStorage.getItem(CHAVE_STORAGE);

  if (tarefasSalvas) {
    try {
      return JSON.parse(tarefasSalvas);
    } catch {
      localStorage.removeItem(CHAVE_STORAGE);
    }
  }

  return Array.from(document.querySelectorAll(".tarefa span")).map((span) => ({
    id: criarId(),
    texto: span.textContent.trim(),
    concluida: false,
  }));
}

function salvarTarefas() {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(tarefas));
}

function adicionarTarefa() {
  const texto = inputTarefa.value.trim();

  if (!texto) {
    inputTarefa.focus();
    return;
  }

  tarefas.push({
    id: criarId(),
    texto,
    concluida: false,
  });

  inputTarefa.value = "";
  salvarTarefas();
  renderizarTarefas();
}

function alternarTarefa(id) {
  tarefas = tarefas.map((tarefa) =>
    tarefa.id === id ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
  );

  salvarTarefas();
  renderizarTarefas();
}

function deletarTarefa(id) {
  tarefas = tarefas.filter((tarefa) => tarefa.id !== id);

  salvarTarefas();
  renderizarTarefas();
}

function obterTarefasFiltradas() {
  if (filtroAtual === "pendentes") {
    return tarefas.filter((tarefa) => !tarefa.concluida);
  }

  if (filtroAtual === "concluidas") {
    return tarefas.filter((tarefa) => tarefa.concluida);
  }

  return tarefas;
}

function criarElementoTarefa(tarefa) {
  const item = document.createElement("div");
  item.className = `tarefa${tarefa.concluida ? " concluida" : ""}`;

  const conteudo = document.createElement("div");
  conteudo.className = "conteudo-tarefa";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = tarefa.concluida;
  checkbox.addEventListener("change", () => alternarTarefa(tarefa.id));

  const texto = document.createElement("span");
  texto.textContent = tarefa.texto;

  const botaoDeletar = document.createElement("button");
  botaoDeletar.className = "deletar";
  botaoDeletar.type = "button";
  botaoDeletar.textContent = "Excluir";
  botaoDeletar.setAttribute("aria-label", `Excluir tarefa: ${tarefa.texto}`);
  botaoDeletar.addEventListener("click", () => deletarTarefa(tarefa.id));

  conteudo.append(checkbox, texto);
  item.append(conteudo, botaoDeletar);

  return item;
}

function renderizarTarefas() {
  const tarefasFiltradas = obterTarefasFiltradas();

  listaTarefas.innerHTML = "";

  if (tarefasFiltradas.length === 0) {
    const mensagem = document.createElement("p");
    mensagem.className = "sem-tarefas";
    mensagem.textContent = "Nenhuma tarefa para mostrar.";
    listaTarefas.appendChild(mensagem);
  } else {
    tarefasFiltradas.forEach((tarefa) => {
      listaTarefas.appendChild(criarElementoTarefa(tarefa));
    });
  }

  atualizarFiltros();
  atualizarProgresso();
}

function atualizarFiltros() {
  botoesFiltro.forEach((botao) => {
    const filtro = normalizarFiltro(botao.textContent);
    const ativo = filtro === filtroAtual;

    botao.classList.toggle("ativo", ativo);
    botao.setAttribute("aria-pressed", String(ativo));
  });
}

function atualizarProgresso() {
  const total = tarefas.length;
  const concluidas = tarefas.filter((tarefa) => tarefa.concluida).length;
  const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100);

  barraProgresso.style.width = `${percentual}%`;
  textoProgresso.textContent = `${percentual}% concluido`;
}

function normalizarFiltro(texto) {
  const filtro = texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (filtro.startsWith("pend")) {
    return "pendentes";
  }

  if (filtro.startsWith("concl")) {
    return "concluidas";
  }

  return "todas";
}

botaoAdicionar.addEventListener("click", adicionarTarefa);

inputTarefa.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    adicionarTarefa();
  }
});

botoesFiltro.forEach((botao) => {
  botao.type = "button";
  botao.addEventListener("click", () => {
    filtroAtual = normalizarFiltro(botao.textContent);
    renderizarTarefas();
  });
});

renderizarTarefas();
