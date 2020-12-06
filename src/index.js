
const fetch = require('node-fetch');
const md5 = require('md5');
const fastify = require('fastify')();
const { APIError } = require('./utils/errors');

class Domosed {
    baseURL = 'https://az-games.ru/api/';
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
    * @param {string} methodName Название метода
    * @param {object} params Параметры метода
    * @description Вызов любого метода API
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
     * @description Вернет информацию о Вашем проекте
     * @returns {object} Информация о Вашем проекте
     */
    getProjectInfo() {
        return this.call('merchants.getInfo')
    }

    /**
     * @param {string} name - Новое имя проекта
     * @param {string} avatar - Прямая ссылка на новый аватар проекта
     * @param {Number} group_id - Цифровой ID нового сообщества проекта
     * @description Редактирует данные Вашего проекта
     */
    editProjectInfo(name, avatar, group_id) {
        return this.call('merchants.edit', { name, avatar, group_id })
    }

    /**
     * @description Отправляет Ваш проект на модерацию, в случае успеха - Вы попадете в каталог
     */
    sendVerify() {
        return this.call('merchants.sendVerify')
    }

    /**
     * @param {Number} toId ID пользователя
     * @param {Number} amount Количество монет
     * @description Совершает перевод монет указанному пользователю
     * @returns {object} Объект перевода
     */
    sendPayment(toId, amount) {
        return this.call('payment.send', { toId, amount })
    }

    /**
     * @param {string} type Тип возвращаемых переводов(all — все, out — исходящие, in — входящие)
     * @param {Number} limit Количество возвращаемых переводов, от 1 до 50
     * @description Возвращает Вам историю платежей
     * @returns {object} Объект перевода
     */
    getHistoryPayments(type = "all", limit = 20) {
        return this.call('payment.getHistory', { type, limit })
    }
    /**
    * @param {Array<Number> | Number} userIds
    * @description Получит баланс выбранных пользователей (не более 20)
    * @returns {object} Объект с ID пользователей и их балансами
    */
    async getBalance(userIds) {
        if (!userIds) throw new ReferenceError('Параметр "userIds" обязателен.')
        if (!Array.isArray(userIds) && !+userIds) throw new ReferenceError('Параметр "userIds" должен быть массивом или числом.')
        return this.call('users.getBalance', { userIds })
    }

    /**
     * @description Получает ссылку для перевода монет
     * @returns {string} Ссылка на перевод монет Вашему проекту
     */
    async getPaymentLink() {
        const { id } = await this.getProjectInfo()
        return 'https://vk.com/app7594692#transfer-' + id
    }

    /**
     * @param {string | Number} path Ваш IP адрес или домен
     * @param {Number} port Прослушиваемый порт
     * @description Запускает прослушивание входящих переводов
     */
    async start(path, port = 8080) {
        if (!path) throw new ReferenceError('Параметр "path" обязателен.')
        if (!path.startsWith('http')) throw new ReferenceError('Параметр "path" должен начинаться с протокола http(s):// .')
        this.call('merchants.webhook.set', {
            url: path + ':' + port + '/transfer'
        })
        return new Promise((resolve) => {
            fastify.post('/transfer', (req, res) => {
                res.send('ok')
                if (req.body.type === 'transfer') {
                    const { amount, fromId, hash } = req.body
                    if (hash === md5(this.access_token + amount + fromId)) {
                        this.onPaymentCallback({ amount, fromId })
                    }
                }
            })
            fastify.listen(port, '::', () => {
                resolve()
            })
        })
    }

    /**
     * @description CallBack входящих переводов
     * @returns {object} Информация о переводе 
     */
    onPayment(context) {
        this.onPaymentCallback = context
    }
}

module.exports = { Domosed }