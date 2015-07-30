export class Observer {
    constructor() {
        this.observers = [];
        this.payload = null;
    }

    subscribe(cb) {
        if(cb instanceof Function) {
            this.observers.push(cb);
        } else {
            throw 'Callback is not a function';
        }
    }

    update(payload) {
        if(payload) {
            this.payload = payload;
            this.refresh();
        } else {
            throw 'Null observable';
        }
    }

    refresh() {
        if(this.payload) {
            for(var i = 0, j = this.observers.length; i < j; i++) {
                this.observers[i](this.payload);
            }
        }
    }

    reset() {
        this.payload = null;
    }
}
