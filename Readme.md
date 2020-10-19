
# Domosed API
NodeJS библиотека для работы с API сервиса "Домосед"
# Установка
**yarn**
 `yarn add domosed`
 
**npm**
 `npm i -S domosed`

## Подключение

``` js
const {
    Domosed
} = require('domosed')
const ds = new Domosed(token)
```

## Методы API
***call*** - универсальный метод отправки запроса

| Параметр | Тип | Обязателен | Описание |
|--|--|--|--|
| methodName | string | Да |Имя метода |
| params | object | Нет | Параметры запроса |

**Пример:**

``` js
async function run() {
    const info = await ds.call('merchants.merchants.edit',{
	    name: 'My test app'
    })
    console.log(info)
}
run().catch(console.error);
```
##
***getProjectInfo*** - Получить информацию о Вашем проекте

**Пример:**

``` js
async function run() {
    const info = await ds.getProjectInfo()
	console.log(info)
}
run().catch(console.error);
```

##
***editProjectInfo*** - Редактировать информацию о Вашем проекте

| Параметр | Тип | Обязателен | Описание |
|--|--|--|--|
| name | string | Нет | Название проекта |
| avatar| string | Нет | Прямая ссылка на новый аватар проекта |
| group_id| number | Нет | ID группы проекта |
* Хотя-бы 1 параметр должен быть передан

**Пример:**

``` js
async function run() {
    const info = await ds.editProjectInfo(
	    'My app', 
	    'vk.com/images/camera_200.png',
		1
	);
	console.log(info)
};

run().catch(console.error); 
```
##
***sendVerify*** - Отправить Ваш проект на модерацию
В случае успешной модерации - Вы будете опубликованы в разделе "развлечения" официального приложения Домосед.

**Пример:**
``` js
async function run() {
    const info = await ds.sendVerify();
	console.log(info);
};

run().catch(console.error); 
```
##
***sendPayment*** - Совершить перевод монет указанному пользователю

| Параметр | Тип | Обязателен | Описание |
|--|--|--|--|
| toId| number | да| ID пользователя, которому Вы собираетесь совершить перевод |
| amount | number | да|Количество монет, которое Вы собираетесь перевести указанному пользователю  |

**Пример:**
``` js
async function run() {
    const info = await ds.sendPayment(1, 1);
	console.log(info);
};

run().catch(console.error); 
```
##
***getHistoryPayments*** - Получить историю последних платежей

| Параметр | Тип | Обязателен | Описание |
|--|--|--|--|
| type | string | нет| Тип возвращаемых переводов(all — все, out — исходящие, in — входящие) |
| limit | number | нет |Количество возвращаемых переводов, от 1 до 50  |

**Пример:**
``` js
async function run() {
    const info = await ds.getHistoryPayments('all', 50);
	console.log(info);
};

run().catch(console.error); 
```
##
***getPaymentLink*** - Получить ссылку на перевод монет проекту

**Пример:**
``` js
async function run() {
    const info = await ds.getPaymentLink();
	console.log(info);
};

run().catch(console.error); 
```
##
***Прослушивание входящих переводов:***
> *Наша библиотека автоматически сверяет hash входящих переводов, защищая Вас от злоумышленников.*

Для начала Вам стоит вызвать функцию **startPolling**

| Параметр | Тип | Обязателен | Описание |
|--|--|--|--|
| path| string\number  | да | Ваш IP адрес или домен. |
| port | number | нет |Прослушиваемый порт |

Затем Вам нужно подписаться на входящие переводы, используя функцию **onPayment**, в параметры который нужно передать callback функцию.


**Пример:**
``` js
function run() {
	ds.startPolling('myAwesomeDomen.ru', 80);
	
	ds.onPayment(context  => {
		const {
			amount, 
			fromId
		} = context;
		console.log(context);
	});
};

run().catch(console.error); 
```