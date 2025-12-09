        
        // ====================================================================
        // VARIÁVEIS GLOBAIS
        // ====================================================================
        let parabolaChart;
        let isDarkMode = false;
        // Chave para armazenar o histórico no localStorage
        const LOCAL_STORAGE_KEY = 'quadratic_equation_history';

        // Elementos UI
        const elements = {
            a: document.getElementById('a-input'),
            b: document.getElementById('b-input'), 
            c: document.getElementById('c-input'),
            calculateBtn: document.getElementById('calculate-btn'),
            deltaDisplay: document.getElementById('delta-display'),
            rootsDisplay: document.getElementById('roots-display'),
            equationDisplay: document.getElementById('equation-display'),
            rootsLabel: document.getElementById('roots-label'),
            historyList: document.getElementById('history-list'),
            historyPlaceholder: document.getElementById('history-placeholder'),
            // userIdDisplay: Removido, pois não é necessário para localStorage
            feedback: document.getElementById('educational-feedback'),
            themeToggle: document.getElementById('theme-toggle'),
            sunIcon: document.getElementById('sun-icon'),
            moonIcon: document.getElementById('moon-icon'),
            voiceBtn: document.getElementById('voice-input-btn'),
            voiceBtnText: document.getElementById('voice-btn-text'),
            modal: document.getElementById('message-modal'),
            modalTitle: document.getElementById('modal-title'),
            modalContent: document.getElementById('modal-content'),
        };

        // ====================================================================
        // FUNÇÕES DE UTILIDADE E UI
        // ====================================================================

        /**
         * Exibe um modal de mensagem customizado (substituindo o alert).
         * @param {string} title Título do modal.
         * @param {string} message Conteúdo da mensagem.
         * @param {string} type Tipo: 'error' (padrão) ou 'info'.
         */
        function showMessage(title, message, type = 'error') {
            if (type === 'error') {
                elements.modalTitle.textContent = title;
                elements.modalTitle.classList.remove('text-primary');
                elements.modalTitle.classList.add('text-secondary');
            } else {
                elements.modalTitle.textContent = title;
                elements.modalTitle.classList.remove('text-secondary');
                elements.modalTitle.classList.add('text-primary');
            }
            elements.modalContent.textContent = message;
            elements.modal.classList.remove('hidden');
            elements.modal.classList.add('flex');
        }

        /** Oculta o modal de mensagem. */
        function hideMessage() {
            elements.modal.classList.remove('flex');
            elements.modal.classList.add('hidden');
        }

        /** Alterna o modo claro/escuro. */
        function toggleTheme() {
            isDarkMode = !isDarkMode;
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
                elements.sunIcon.classList.add('hidden');
                elements.moonIcon.classList.remove('hidden');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                elements.sunIcon.classList.remove('hidden');
                elements.moonIcon.classList.add('hidden');
                localStorage.setItem('theme', 'light');
            }
            // Atualiza o gráfico após a mudança de tema
            if (parabolaChart) {
                plotParabola(
                    parseFloat(elements.a.value),
                    parseFloat(elements.b.value),
                    parseFloat(elements.c.value)
                );
            }
        }

        /** Inicializa o tema baseado na preferência salva ou no sistema. */
        function initTheme() {
            const savedTheme = localStorage.getItem('theme');
            const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (savedTheme === 'dark' || (!savedTheme && systemPreference)) {
                isDarkMode = false; // Será invertido por toggleTheme
                toggleTheme();
            } else {
                isDarkMode = true; // Será invertido por toggleTheme
                toggleTheme();
            }
            elements.themeToggle.addEventListener('click', toggleTheme);
        }

        // ====================================================================
        // LOCAL STORAGE (HISTÓRICO)
        // ====================================================================

        /**
         * Carrega o histórico de equações do localStorage.
         * @returns {Array<Object>} Lista de equações resolvidas.
         */
        function loadHistory() {
            try {
                const historyJson = localStorage.getItem(LOCAL_STORAGE_KEY);
                return historyJson ? JSON.parse(historyJson) : [];
            } catch (error) {
                console.error("Erro ao carregar histórico do localStorage:", error);
                return [];
            }
        }

        /**
         * Salva uma equação resolvida no localStorage e atualiza a UI.
         * @param {number} a Coeficiente a.
         * @param {number} b Coeficiente b.
         * @param {number} c Coeficiente c.
         * @param {number} delta Valor de Delta.
         * @param {string} roots Raízes calculadas.
         */
        function saveEquationToLocalStorage(a, b, c, delta, roots) {
            const history = loadHistory();
            const newEntry = {
                a, b, c, delta, roots,
                // Adiciona um timestamp simples para ordenação
                timestamp: Date.now() 
            };
            
            // Adiciona o novo item e limita o tamanho do histórico a 20 entradas (opcional)
            history.unshift(newEntry);
            if (history.length > 20) {
                history.pop();
            }

            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
                console.log("Equação salva no localStorage com sucesso.");
            } catch (error) {
                console.error("Erro ao salvar no localStorage:", error);
            }

            renderHistory(history); // Renderiza imediatamente após salvar
        }

        /**
         * Renderiza o histórico de equações na UI.
         * @param {Array<Object>} history Dados do histórico.
         */
        function renderHistory(history) {
            elements.historyList.innerHTML = '';
            
            if (history.length === 0) {
                elements.historyList.appendChild(elements.historyPlaceholder);
                elements.historyPlaceholder.textContent = "Nenhum histórico encontrado. Resolva uma equação!";
                elements.historyPlaceholder.classList.remove('hidden');
                return;
            }

            elements.historyPlaceholder.classList.add('hidden');
            
            // Ordena do mais recente para o mais antigo (baseado no timestamp local)
            history.sort((a, b) => b.timestamp - a.timestamp);

            history.forEach(item => {
                const date = item.timestamp ? new Date(item.timestamp).toLocaleTimeString('pt-BR') : 'Sem data';
                const itemEl = document.createElement('div');
                itemEl.className = 'p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-card hover:bg-gray-100 dark:hover:bg-slate-600 transition duration-150 cursor-pointer';
                itemEl.innerHTML = `
                    <p class="font-semibold text-sm break-all">Eq: ${item.a}x² ${item.b < 0 ? item.b : '+' + item.b}x ${item.c < 0 ? item.c : '+' + item.c} = 0</p>
                    <p class="text-xs mt-1">Δ: ${item.delta}</p>
                    <p class="text-xs">Raízes: ${item.roots}</p>
                    <p class="text-[10px] text-right opacity-60">${date}</p>
                `;
                itemEl.onclick = () => {
                    // Preenche os campos de input com a equação do histórico
                    elements.a.value = item.a;
                    elements.b.value = item.b;
                    elements.c.value = item.c;
                    calculateAndPlot();
                };
                elements.historyList.appendChild(itemEl);
            });
        }

        /** Inicia o carregamento do histórico do localStorage. */
        function setupHistoryListener() {
            const initialHistory = loadHistory();
            renderHistory(initialHistory);
        }

        // ====================================================================
        // GRÁFICO (CHART.JS)
        // ====================================================================

        /**
         * Cria os pontos da parábola para o gráfico.
         * @param {number} a Coeficiente a.
         * @param {number} b Coeficiente b.
         * @param {number} c Coeficiente c.
         * @param {number} roots Raízes da equação (se existirem).
         * @returns {Object} Dados para o Chart.js.
         */
        function createParabolaData(a, b, c, roots = []) {
            const dataPoints = [];
            let minX, maxX;

            // Determina a faixa de X para melhor visualização
            const xV = -b / (2 * a);
            
            // Ajusta o range para incluir o vértice e as raízes
            let xValues = [xV];
            roots.filter(r => isFinite(r)).forEach(r => xValues.push(r));

            if (xValues.length > 0) {
                const minVal = Math.min(...xValues);
                const maxVal = Math.max(...xValues);
                // Garante que o intervalo centralize o vértice/raízes, mas com uma margem de 5 unidades.
                let padding = Math.max(5, (maxVal - minVal) * 0.2); 
                minX = Math.min(minVal, xV) - padding;
                maxX = Math.max(maxVal, xV) + padding;
            } else {
                // Se não houver raízes (delta < 0), centra no vértice com um range padrão.
                minX = xV - 10;
                maxX = xV + 10;
            }

            // Garante um intervalo mínimo
            if (maxX - minX < 5) {
                const center = (maxX + minX) / 2;
                minX = center - 2.5;
                maxX = center + 2.5;
            }
            
            const step = (maxX - minX) / 100;

            for (let x = minX; x <= maxX; x += step) {
                const y = a * x * x + b * x + c;
                dataPoints.push({ x: x, y: y });
            }

            // Pontos das raízes para destacar
            const rootPoints = roots
                .filter(r => isFinite(r))
                .map(r => ({ x: r, y: 0, label: `Raiz ${r.toFixed(4)}` }));
            
            // Ponto do vértice (V)
            const yV = a * xV * xV + b * xV + c;
            const vertexPoint = { x: xV, y: yV, label: `Vértice (${xV.toFixed(4)}, ${yV.toFixed(4)})` };

            return { dataPoints, rootPoints, vertexPoint };
        }

        /**
         * Inicializa ou atualiza o gráfico da parábola.
         * @param {number} a Coeficiente a.
         * @param {number} b Coeficiente b.
         * @param {number} c Coeficiente c.
         * @param {number} roots Raízes da equação.
         */
        function plotParabola(a, b, c, roots = []) {
            const { dataPoints, rootPoints, vertexPoint } = createParabolaData(a, b, c, roots);
            const ctx = document.getElementById('parabolaChart').getContext('2d');
            
            // Cores baseadas no tema
            const axisColor = isDarkMode ? 'rgba(226, 232, 240, 0.7)' : 'rgba(15, 23, 42, 0.7)'; // slate-200 / slate-900
            const gridColor = isDarkMode ? 'rgba(226, 232, 240, 0.15)' : 'rgba(15, 23, 42, 0.1)';
            const textColor = isDarkMode ? '#e2e8f0' : '#0f172a';

            if (parabolaChart) {
                parabolaChart.destroy(); // Destrói o gráfico anterior
            }

            parabolaChart = new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [
                        {
                            label: `Parábola: y = ${a}x² ${b < 0 ? b : '+' + b}x ${c < 0 ? c : '+' + c}`,
                            data: dataPoints,
                            backgroundColor: 'rgba(59, 130, 246, 1)', // primary
                            borderColor: 'rgba(59, 130, 246, 0.8)',
                            borderWidth: 3,
                            showLine: true,
                            pointRadius: 0,
                            pointHoverRadius: 0,
                            fill: false,
                        },
                        {
                            label: 'Raízes (Eixo X)',
                            data: rootPoints,
                            backgroundColor: '#ef4444', // secondary (vermelho)
                            pointRadius: 6,
                            pointHoverRadius: 8,
                            showLine: false,
                        },
                        {
                            label: 'Vértice',
                            data: [vertexPoint],
                            backgroundColor: '#22c55e', // green-500
                            pointRadius: 6,
                            pointHoverRadius: 8,
                            showLine: false,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 500 },
                    plugins: {
                        legend: { labels: { color: textColor } },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const point = context.raw;
                                    let label = context.dataset.label || '';
                                    if (label) label += ': ';
                                    if (point.label) return point.label;
                                    return `(x: ${point.x.toFixed(4)}, y: ${point.y.toFixed(4)})`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom',
                            title: { display: true, text: 'Eixo X', color: textColor },
                            grid: { color: gridColor },
                            ticks: { color: axisColor }
                        },
                        y: {
                            title: { display: true, text: 'Eixo Y', color: textColor },
                            grid: { color: gridColor },
                            ticks: { color: axisColor }
                        }
                    }
                }
            });
        }


        // ====================================================================
        // LÓGICA DA EQUAÇÃO E VALIDAÇÃO
        // ====================================================================

        /**
         * Calcula o delta e as raízes da equação de 2º grau.
         */
        function calculateAndPlot() {
            const a = parseFloat(elements.a.value);
            const b = parseFloat(elements.b.value);
            const c = parseFloat(elements.c.value);

            elements.feedback.classList.add('hidden');
            elements.feedback.innerHTML = '';
            
            // 1. VALIDAÇÃO DE ENTRADA
            if (!isFinite(a) || !isFinite(b) || !isFinite(c)) {
                showMessage("Erro de Entrada", "Por favor, insira valores numéricos válidos para a, b e c.");
                return;
            }

            if (a === 0) {
                showMessage("Erro de Coeficiente 'a'", "O coeficiente 'a' não pode ser zero em uma equação de segundo grau. Se a=0, a equação é linear.");
                return;
            }

            // Exibir a equação no display
            const eqText = `${a}x² ${b < 0 ? b : '+' + b}x ${c < 0 ? c : '+' + c} = 0`;
            elements.equationDisplay.textContent = eqText;

            // 2. CÁLCULO DE DELTA
            const delta = b * b - 4 * a * c;
            elements.deltaDisplay.textContent = delta.toFixed(4);

            let rootsText = '';
            let roots = [];
            let feedbackContent = '';

            // 3. ANÁLISE DO DELTA E CÁLCULO DAS RAÍZES
            if (delta > 0) {
                // Duas raízes reais e distintas
                const x1 = (-b + Math.sqrt(delta)) / (2 * a);
                const x2 = (-b - Math.sqrt(delta)) / (2 * a);
                roots = [x1, x2];
                rootsText = `x' ≈ ${x1.toFixed(4)}, x'' ≈ ${x2.toFixed(4)}`;
                elements.rootsLabel.textContent = "x' e x''";
                feedbackContent = `O Delta ($\Delta$ = ${delta.toFixed(4)}) é positivo. Isso significa que a parábola intercepta o eixo X em DOIS pontos distintos (duas raízes reais).`;

            } else if (delta === 0) {
                // Uma raiz real (ou duas raízes reais e iguais)
                const x = -b / (2 * a);
                roots = [x];
                rootsText = `x' = x'' ≈ ${x.toFixed(4)}`;
                elements.rootsLabel.textContent = "x' = x''";
                feedbackContent = `O Delta ($\Delta$ = 0) é zero. Isso significa que a parábola TOCA o eixo X em um único ponto (duas raízes reais e iguais).`;

            } else {
                // Raízes complexas (Delta negativo)
                const realPart = -b / (2 * a);
                const imaginaryPart = Math.sqrt(-delta) / (2 * a);
                rootsText = `x' ≈ ${realPart.toFixed(4)} + ${imaginaryPart.toFixed(4)}i, x'' ≈ ${realPart.toFixed(4)} - ${imaginaryPart.toFixed(4)}i`;
                roots = []; // Raízes complexas não interceptam o eixo X real
                elements.rootsLabel.textContent = "x' e x'' (Complexas)";
                
                // Feedback educacional para raízes complexas
                feedbackContent = `
                    O Delta ($\Delta$ = ${delta.toFixed(4)}) é negativo.
                    Isso significa que a equação não possui raízes REAIS.
                    As raízes são NÚMEROS COMPLEXOS.
                    Visualmente, a parábola NÃO INTERCEPTA o eixo X, ficando totalmente acima ou abaixo dele.
                `;
            }

            elements.rootsDisplay.textContent = rootsText;
            
            // Exibir feedback
            elements.feedback.innerHTML = feedbackContent.replace(/\$/g, ''); // Remove $ para não confundir com o texto
            elements.feedback.classList.remove('hidden');

            // 4. GRÁFICO
            plotParabola(a, b, c, roots);

            // 5. SALVAR HISTÓRICO (USANDO LOCAL STORAGE)
            saveEquationToLocalStorage(a, b, c, delta.toFixed(4), rootsText);
        }

        // ====================================================================
        // SPEECH RECOGNITION (ENTRADA POR VOZ)
        // ====================================================================

        /** Configura e inicia o reconhecimento de voz. */
        // ====================================================================
// RECONHECIMENTO DE VOZ (FUNCIONAL E COMPATÍVEL)
// ====================================================================

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

function setupVoiceInput() {
    if (!window.SpeechRecognition) {
        elements.voiceBtn.disabled = true;
        elements.voiceBtn.classList.add('opacity-50', 'cursor-not-allowed');
        elements.voiceBtnText.textContent = 'Voz (Não Suportado)';
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        elements.voiceBtn.classList.remove('bg-secondary');
        elements.voiceBtn.classList.add('bg-orange-500', 'animate-pulse');
        elements.voiceBtnText.textContent = 'Ouvindo...';
    };

    recognition.onerror = (event) => {
        resetVoiceButton();
        console.error("Erro de voz:", event.error);
        showMessage("Erro de Voz", `Erro: ${event.error}. Verifique microfone e permissões.`);
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log("Transcrição:", transcript);
        processVoiceTranscript(transcript);
    };

    recognition.onend = () => {
        resetVoiceButton();
    };

    elements.voiceBtn.onclick = () => {
        try {
            recognition.start();
        } catch (err) {
            console.warn("Falhou ao iniciar:", err);
        }
    };
}

function resetVoiceButton() {
    elements.voiceBtn.classList.remove('bg-orange-500', 'animate-pulse');
    elements.voiceBtn.classList.add('bg-secondary');
    elements.voiceBtnText.textContent = 'Entrada por Voz';
}


// ====================================================================
// TRATAMENTO DO TEXTO FALADO
// ====================================================================

function processVoiceTranscript(transcript) {
    console.log("Transcrição original:", transcript);

    // Normaliza para evitar variações
    let text = transcript
        .toLowerCase()
        .replace(/mais\s+/g, "")  // remove palavra "mais"
        .replace(/é\s+/g, "igual a ") // transforma "a é 2" em "a igual a 2"
        .replace(/vale\s+/g, "igual a ")
        .replace(/=/g, "igual a ")
        .replace(/,/g, " ")
        .replace(/;/g, " ");

    // Converte palavras em números
    text = text
        .replace(/menos\s+/g, "-")
        .replace(/ponto\s+/g, ".")
        .replace(/vírgula\s+/g, ".");

    console.log("Transcrição normalizada:", text);

    // Regex melhorado: captura frases longas
    const regex = /(a|b|c)\s*(?:igual a)?\s*(-?\d+(\.\d+)?)/g;
    let match;
    const values = {};

    while ((match = regex.exec(text)) !== null) {
        const coef = match[1];
        const number = parseFloat(match[2]);
        values[coef] = number;
    }

    let success = false;

    if (values.a !== undefined) { elements.a.value = values.a; success = true; }
    if (values.b !== undefined) { elements.b.value = values.b; success = true; }
    if (values.c !== undefined) { elements.c.value = values.c; success = true; }

    if (success) {
        showMessage(
            "Entrada de Voz Sucesso",
            "Coeficientes preenchidos com sucesso! Pressione Calcular para gerar o gráfico.",
            "info"
        );
    } else {
        showMessage(
            "Comando de Voz Inválido",
            "Tente dizer: 'a igual a 2', 'b igual a menos 3', 'c igual a cinco ponto dois'.",
            "error"
        );
    }
}


// ====================================================================
// ATIVA O SISTEMA AO CARREGAR A PÁGINA
// ====================================================================

document.addEventListener("DOMContentLoaded", () => {
    setupVoiceInput();
});


        // ====================================================================
        // QR CODE
        // ====================================================================

        /** Gera o QR Code com a URL de destino (GitHub Pages). */
        function generateQRCode() {
            // ====================================================================
            // INSTRUÇÃO CRÍTICA PARA O HOSTING NO GITHUB PAGES:
            //
            // 1. URL DE DESTINO FINAL (Obrigatório após o Deploy):
            //    APÓS HOSPEDAR NO GITHUB PAGES, SUBSTITUA O CONTEÚDO DA VARIÁVEL 
            //    'FINAL_GITHUB_URL' PELA URL COMPLETA DO SEU PROJETO (ex: https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/).
            const FINAL_GITHUB_URL = "https://afonsoegmar.github.io/equacao-grau2/"; 
            
            // 2. URL A SER USADA:
            //    - No ambiente de preview (como este), usamos a URL atual para testar.
            //    - APÓS O DEPLOY no GitHub, MANTENHA SOMENTE A LINHA 'urlToUse = FINAL_GITHUB_URL;'
            
            let urlToUse;
            
            // VERIFICA SE O USUÁRIO FORNECEU UMA URL VÁLIDA NA VARIÁVEL FINAL_GITHUB_URL
            if (FINAL_GITHUB_URL.includes("SEU-USUARIO") || FINAL_GITHUB_URL === "") {
                // Caso ainda não tenha sido configurada a URL final, usa a URL atual (do Preview)
                urlToUse = window.location.href; 
                console.warn("Aviso: FINAL_GITHUB_URL ainda não foi configurada. Usando URL de Preview para o QR Code.");
            } else {
                // Usa a URL final configurada pelo usuário (ideal para deploy)
                urlToUse = FINAL_GITHUB_URL; 
                console.log("Usando FINAL_GITHUB_URL para o QR Code:", urlToUse);
            }
            
            // ====================================================================

            const qrcodeDiv = document.getElementById("qrcode");
            
            if (qrcodeDiv.innerHTML === '') { // Evita regenerar
                new QRCode(qrcodeDiv, {
                    text: urlToUse,
                    width: 160,
                    height: 160,
                    colorDark : "#0f172a",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
            }
        }

        // ====================================================================
        // INICIALIZAÇÃO
        // ====================================================================

        /**
         * Inicializa as funcionalidades do app (chamada após o DOM estar pronto).
         */
        function mainAppInit() {
            console.log("Inicialização do App principal (LocalStorage).");
            
            // 1. Inicializa o tema (claro/escuro)
            initTheme();

            // 2. Configura o carregamento do Histórico (LocalStorage)
            setupHistoryListener();

            // 3. Configura a Entrada de Voz
            setupVoiceInput();

            // 4. Configura o QR Code
            generateQRCode();
            
            // 5. Configura o Event Listener principal
            elements.calculateBtn.addEventListener('click', calculateAndPlot);

            // 6. Faz o cálculo inicial com os valores de exemplo
            calculateAndPlot();
        }
        
        // Chamada principal para iniciar a aplicação
        document.addEventListener('DOMContentLoaded', mainAppInit);

    