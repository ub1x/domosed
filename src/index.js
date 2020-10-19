
const fetch = require('node-fetch');
const { APIError } = require('./utils/errors');
class Domosed {
    baseURL = 'https://minebattle.ru/api/';
    onPaymentCallback
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
     * @returns {string | object} Ответ на Ваш API запрос
     */
    async call(methodName, params = {}) {
        if (!methodName) {
            throw new ReferenceError(
                'Вы не указали параметр "methodName"'
            )
        }
        const json = await fetch(this.baseURL + methodName, {
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
     * @param {Number} toId ID пользователя
     * @param {Number} amount Количество монет
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
     * @returns {string} Объект перевода
     */
    async getPaymentLink() {
        const { id } = await this.getProjectInfo()
        return 'https://vk.com/app7594692#transfer-' + id
    }
    /**
     * Запускает прослушивание входящих переводов.
     * @param {string | Number} path Ваш IP адрес или домен.
     * @param {Number} port Прослушиваемый порт
     */
    async startPolling(path, port = 8080) {
        if (!path) throw new ReferenceError('Параметр "path" обязателен.')
        if (!path.startsWith('http://') || !path.startsWith('https://')) throw new ReferenceError('Параметр "path" должен начинаться с протокола http(s)://.')
        this.call('merchants.webhook.set', {
            url: path + ':' + port + '/transfer'
        })
        return new Promise((resolve) => {
            const fastify = require('fastify')();

            fastify.get('/', (req, res) => {
                return res.send('ok')
            })

            fastify.post('/transfer', (req, res) => {
                res.send('ok')
                if (req.body.type === 'transfer') {
                    const { amount, fromId } = req.body
                    this.onPaymentCallback({ amount, fromId })
                }
            })
            fastify.listen(port, '::', () => {
                console.log('Прослушивание запущено...' + port)
                resolve()
            })
        })
    }

    /**
     * @returns {object} Информация о переводе 
     */
    onPayment(context) {
        this.onPaymentCallback = context
    }
}

module.exports = { Domosed }