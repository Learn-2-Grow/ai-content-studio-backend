import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class AxiosHelper {
    private static instance: AxiosHelper;
    private axiosInstance: AxiosInstance;

    private constructor() {
        this.axiosInstance = axios.create({
            timeout: 120000, // 120 seconds timeout
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    static getInstance(): AxiosHelper {
        AxiosHelper.instance = AxiosHelper.instance || new AxiosHelper();
        return AxiosHelper.instance;
    }

    async post<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig,
    ): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data
                    ? JSON.stringify(error.response.data)
                    : error.message;
                throw new Error(`HTTP ${error.response?.status || 'Unknown'} - ${errorMessage}`);
            }
            throw error;
        }
    }


    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data
                    ? JSON.stringify(error.response.data)
                    : error.message;
                throw new Error(`HTTP ${error.response?.status || 'Unknown'} - ${errorMessage}`);
            }
            throw error;
        }
    }

    async put<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig,
    ): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data
                    ? JSON.stringify(error.response.data)
                    : error.message;
                throw new Error(`HTTP ${error.response?.status || 'Unknown'} - ${errorMessage}`);
            }
            throw error;
        }
    }


    getAxiosInstance(): AxiosInstance {
        return this.axiosInstance;
    }
}
