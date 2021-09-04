class Notification {

    #data;
    #response;

    constructor(res){
        if(!res){
            console.log('notification response object is required');
            process.exit(1);
        }

        if(typeof(res) !== 'object'){
            console.log('notification response object is required to be a valid object');
            process.exit(1);
        }

        this.#response = res;
    }

    get response(){
        return this.#response
    }

    get data(){
        return this.#data
    }

    async push(data){
        if(!data && typeof(data) !== 'object'){
            console.log('cannot push notification, data not specified')
            process.exit(1)
        }

        this.#data = data;

        const _data = `data: ${JSON.stringify(this.#data)}\n\n`;
        await this.#response.write(_data);
        this.#response.end(); 
    }
}

module.exports = Notification;