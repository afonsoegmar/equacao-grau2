🧮 Solucionador de Equação de Segundo Grau

Este projeto é uma ferramenta interativa e educacional projetada para ajudar estudantes e entusiastas a compreender e resolver equações quadráticas ($ax^2 + bx + c = 0$).

1. A Fórmula de Bhaskara

A chave para resolver qualquer equação de segundo grau é a Fórmula de Bhaskara, que é usada para encontrar as raízes (os valores de $x$ que tornam a equação verdadeira).

$$x = \frac{-b \pm \sqrt{\Delta}}{2a}$$

O que é o Delta ($\Delta$)?

O Delta é o discriminante da equação e é calculado antes das raízes. Ele determina a natureza das raízes:

$$\Delta = b^2 - 4ac$$

2. Análise do Delta

O valor de $\Delta$ tem um impacto direto no formato da parábola e na quantidade de soluções reais:

Valor do $\Delta$

Interpretação das Raízes

Representação no Gráfico

$\Delta > 0$

Duas raízes reais e distintas.

A parábola cruza o eixo $X$ em dois pontos.

$\Delta = 0$

Uma raiz real (ou duas raízes reais e iguais).

A parábola toca o eixo $X$ em um único ponto (o vértice).

$\Delta < 0$

Nenhuma raiz real (duas raízes complexas).

A parábola não toca o eixo $X$, ficando totalmente acima ou abaixo dele.

3. Componentes Educacionais da Aplicação

Validação e Erros: O sistema impede que o coeficiente $a$ seja zero e avisa o usuário caso insira valores não numéricos, garantindo a integridade do cálculo.

Feedback Educacional: Após o cálculo, uma mensagem detalhada explica o significado do $\Delta$ encontrado (positivo, zero ou negativo) e sua relação com o gráfico.

Gráfico Interativo: Um gráfico da parábola é gerado em tempo real, marcando claramente as raízes encontradas e o vértice.

Histórico Local: Todas as equações resolvidas são salvas no seu navegador (via localStorage), permitindo que você revise problemas passados e recarregue-os com um clique.

Entrada por Voz (Experimental): Permite inserir os coeficientes ditando-os ("A igual a 5, B igual a menos 2"), tornando a entrada de dados mais acessível e rápida.

Modo Escuro/Claro: Oferece controle de tema para melhor conforto visual.