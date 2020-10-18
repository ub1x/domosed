
const fetch = require('node-fetch')
const express = require('express')
const ip = require('ip');
class Domosed {
    baseURL = 'https://minebattle.ru/api/test';
    isStarted = false;
    onPaymentCallback = null;
    /**
     * @param {string} access_token Токен проекта
     */
    constructor(access_token) {
        if (!access_token) {
            throw new ReferenceError(
                'Параметр "access_token" обязателен.'
            );
        }
        this.access_token = access_token;
    };


    /**
     * Вызов любого метода API
     * @param {string} methodName Название метода
     * @param {object} params Параметры метода
     * @returns {*} Ответ на Ваш API запрос
     */
    async call(methodName, params = {}) {
        if (!methodName) {
            throw new ReferenceError(
                'Вы не указали параметр \"methodName\"'
            )
        }
        const json = await fetch(this.baseURL + '/' + methodName, {
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                access_token: this.access_token,
                ...params
            }),
            method: 'POST'
        })

        const response = await json.json()
        if (response.error) {
            throw new APIError({
                code: response.error.error_code,
                msg: response.error.error_msg
            })
        };
        return response.response.msg
    }

    /**
     * Вернет информацию о Вашем проекте
     * @returns {object} Информация о Вашем проекте
     */
    getProjectInfo() {
        return this.call('merchants.getInfo')
    }
    /**
     * Редактирует данные Вашего проекта
     * @param {string} name 
     * @param {string} avatar 
     * @param {Number} group_id 
     */
    editProjectInfo(name, avatar, group_id) {
        return this.call('merchants.edit', { name, avatar, group_id })
    }

    /**
     * Отправляет Ваш проект на модерацию, в случае успеха - Вы попадете в каталог.
     */
    sendVerify() {
        return this.call('merchants.sendVerify')
    }

    /**
     * Совершает перевод монет указанному пользователю
     * @param {Number} toId 
     * @param {Number} amount 
     * @returns {object} Объект перевода
     */
    sendPayment(toId, amount) {
        return this.call('payment.send', { toId, amount })
    }

    /**
     * 
     * @param {string} type Тип возвращаемых переводов(all — все, out — исходящие, in — входящие)
     * @param {Number} limit Количество возвращаемых переводов, от 1 до 50
     * @returns {object} Объект перевода
     */
    getHistoryPayments(type = "all", limit = 20) {
        return this.call('payment.getHistory', { type, limit })
    }
    /**
     * @returns {String} Объект перевода
     */
    async getPaymentLink() {
        const { id } = await this.getProjectInfo()
        return 'https://vk.com/app7594692#transfer-' + id
    }
    /**
     * Запускает прослушивание входящих переводов.
     * Вы можете не указывать параметры ниже, и они установятся по умолчанию.
     * @param {*} path Ваш IP адрес или домен.
     * @param {Number} port Прослушиваемый порт
     */
    async startPolling(path, port = 8080) {
        if (!path) path = ip.address()
        this.call('merchants.webhook.set', {
            url: 'http://' + path + ':' + port + '/transfer'
        })
        return new Promise((resolve) => {
            const app = express();

            app.use(express.urlencoded({ extended: true }))
            app.use(express.json({ strict: true }))
            app.set("view engine", "ejs")
            app.use(express.static("public"))

            app.post('/transfer', (req, res) => {
                res.sendStatus(200)
                if (req.body.type === 'transfer') {
                    const { amount, fromId } = req.body
                    this.onPaymentCallback({
                        amount,
                        fromId
                    })
                }
            })
            app.listen(port, () => {
                console.log('Прослушивание запущено...')
                resolve()
            })
        })
    }


    /**
     * @returns {object} Информация о переводе
     */
    onPayment(context = {}) {
        this.onPaymentCallback = context
    }
}

class APIError extends Error {

    /**
     * @param params Параметры ошибки
     */

    constructor(params) {
        super(params.msg)
        this.code = params.code;
        this.msg = params.msg;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = { Domosed }