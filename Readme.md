---


---

<h1 id="domosed-api">Domosed API</h1>
<p>NodeJS библиотека для работы с API сервиса “Домосед”</p>
<h1 id="установка">Установка</h1>
<p><em>yarn</em><br>
<code>yarn add domosed</code></p>
<p><em>npm</em><br>
<code>npm i -S domosed</code></p>
<h2 id="подключение">Подключение</h2>
<pre class=" language-js"><code class="prism  language-js"><span class="token keyword">const</span> <span class="token punctuation">{</span> Domosed <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">'./index'</span><span class="token punctuation">)</span>
<span class="token keyword">const</span> ds <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Domosed</span><span class="token punctuation">(</span>token<span class="token punctuation">)</span>
</code></pre>
<h2 id="методы-api">Методы API</h2>

<table>
<thead>
<tr>
<th>Параметр</th>
<th>Тип</th>
<th>Обязателен</th>
<th>Описание</th>
</tr>
</thead>
<tbody>
<tr>
<td>methodName</td>
<td>String</td>
<td>Да</td>
<td>Имя метода</td>
</tr>
<tr>
<td>params</td>
<td>object</td>
<td>Нет</td>
<td>Параметры запроса</td>
</tr>
</tbody>
</table><p><strong>Пример:</strong></p>
<pre class=" language-js"><code class="prism  language-js"><span class="token keyword">async</span> <span class="token keyword">function</span> <span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">const</span> info <span class="token operator">=</span> <span class="token keyword">await</span> ds<span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span><span class="token string">'merchants.getInfo'</span><span class="token punctuation">)</span>
	console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>info<span class="token punctuation">)</span>
<span class="token punctuation">}</span>
<span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token keyword">catch</span><span class="token punctuation">(</span>console<span class="token punctuation">.</span>error<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>

