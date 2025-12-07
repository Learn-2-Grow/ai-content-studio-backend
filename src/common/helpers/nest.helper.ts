import mongoose from "mongoose";

export class NestHelper {
    private static instance: NestHelper;
    // constructor() {}

    static getInstance(): NestHelper {
        NestHelper.instance = NestHelper.instance || new NestHelper();
        return NestHelper.instance;
    }

    isEmpty<T>(value: string | number | boolean | object | Array<T>): boolean {
        return (
            // null or undefined
            value == null ||
            value == undefined ||
            value == '' ||
            value == 0 ||
            value == false ||
            (typeof value == 'string' && value?.trim() == '') ||
            // has length and it's zero
            (value.hasOwnProperty('length') && (value as Array<T>).length === 0) ||
            // is an Object and has no keys
            (value.constructor === Object && Object.keys(value).length === 0)
        );
    }

    arrayFirstOrNull<T>(arr: Array<T>): T | null {
        if (arr.hasOwnProperty('length') && arr.length > 0) {
            return arr[0];
        } else {
            return null;
        }
    }


    getBooleanValue(input: string | boolean): boolean {
        if (typeof input === 'boolean') {
            return input;
        } else if (typeof input === 'string') {
            let lowerCaseInput = input.toLowerCase();
            if (lowerCaseInput === 'true') {
                return true;


            } else if (lowerCaseInput === 'false') {
                return false;
            }
        }
        return false;
    }

    getObjectId(id: any): mongoose.Types.ObjectId {

        if (typeof id === 'string') {
            return mongoose.Types.ObjectId.createFromHexString(id);
        } else if (typeof id === 'object' && id._id) {
            return id._id;
        } else {
            throw new Error('Invalid id');
        }
    }
}
