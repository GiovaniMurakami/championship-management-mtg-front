import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { uploadParaS3 } from "../services/backendApi";

describe("uploadParaS3", () => {
    const OriginalXMLHttpRequest = globalThis.XMLHttpRequest;
    let lastRequest = null;

    class MockXMLHttpRequest {
        constructor() {
            this.headers = {};
            this.upload = {};
            this.withCredentials = true;
            lastRequest = this;
        }

        open(method, url) {
            this.method = method;
            this.url = url;
        }

        setRequestHeader(name, value) {
            this.headers[name] = value;
        }

        send(body) {
            this.body = body;
            this.status = 200;
            this.onload();
        }
    }

    beforeEach(() => {
        lastRequest = null;
        globalThis.XMLHttpRequest = MockXMLHttpRequest;
    });

    afterEach(() => {
        globalThis.XMLHttpRequest = OriginalXMLHttpRequest;
    });

    it("envia apenas o binario com o mesmo Content-Type e sem headers globais", async () => {
        const file = new File([new Uint8Array([1, 2, 3])], "banner.png", { type: "image/png" });

        await uploadParaS3("https://bucket.s3.amazonaws.com/upload", file, vi.fn());

        expect(lastRequest.method).toBe("PUT");
        expect(lastRequest.url).toBe("https://bucket.s3.amazonaws.com/upload");
        expect(lastRequest.body).toBe(file);
        expect(lastRequest.headers).toEqual({ "Content-Type": "image/png" });
        expect(lastRequest.headers.Authorization).toBeUndefined();
        expect(lastRequest.headers["Content-Length"]).toBeUndefined();
        expect(lastRequest.withCredentials).toBe(false);
    });
});
