const START_SIZE = 1024; // TODO: Use reasonable size which has to grow during tests

declare function logStr(str: string): void;
declare function logF64(val: f64): void;

export class BSONEncoder {
    offsets: Array<i32> = new Array<i32>();
    buffer: Uint8Array = new Uint8Array(START_SIZE)
    writeIndex: i32 = 4  // Make place for total size 

    serialize(): Uint8Array {
        this.writeByte(0);
        this.int32(this.writeIndex, 0);
        return this.buffer.subarray(0, this.writeIndex);
    }

    setString(name: string, value: string): void {
        this.writeByte(0x02);           // BSON type: String
        this.cstring(name);
        let startOffset = this.writeIndex;
        this.writeIndex += 4;
        this.cstring(value);
        this.int32(this.writeIndex - startOffset - 4, startOffset);
    }

    setBoolean(name: string, value: bool): void {
        this.writeByte(0x08);           // BSON type: Boolean
        this.cstring(name);
        this.writeByte(value ? 1 : 0);
    }

    setNull(name: string): void {
        this.writeByte(0x0A);             // BSON type: Null
        this.cstring(name);
    }

    setInteger(name: string, value: i32): void {
        this.writeByte(0x10);       // BSON type: int32
        this.cstring(name);
        this.int32(value);
    }

    setUint8Array(name: string, value: Uint8Array): void {
        this.writeByte(0x05);           // BSON type: Binary data
        this.cstring(name);
        this.int32(value.length);
        this.writeByte(0);              // use generic binary subtype 0
        for (let i = 0; i < value.length; i++) {
            this.writeByte(value[i]);
        }
    }

    pushArray(name: string): void {
        this.writeByte(0x04);           // BSON type: Array
        this.cstring(name);
        this.offsets.push(this.writeIndex);
        this.writeIndex += 4;
    }

    popArray(): void {
        this.writeByte(0);
        let startOffset = this.offsets.pop();
        this.int32(this.writeIndex - startOffset, startOffset);
    }

    pushObject(name: string): void {
        this.writeByte(0x03);           // BSON type: Document
        this.cstring(name);
        this.offsets.push(this.writeIndex);
        this.writeIndex += 4;
    }

    popObject(): void {
        this.writeByte(0);
        let startOffset = this.offsets.pop();
        this.int32(this.writeIndex - startOffset, startOffset);
    }

    private cstring(str: string): void {
        // TODO: Handle newlines properly
        // str = str.replace(/\r\n/g, '\n');
        // TODO: Maybe use AssemblyScript std Unicode conversion?
        for (let i = 0, len = str.length; i < len; i++) {
            let c = str.charCodeAt(i);
            if (c < 128) {
                this.writeByte(c);
            } else if (c < 2048) {
                this.writeByte((c >>> 6) | 192);
                this.writeByte((c & 63) | 128);
            } else {
                this.writeByte((c >>> 12) | 224);
                this.writeByte(((c >>> 6) & 63) | 128);
                this.writeByte((c & 63) | 128);
            }
        }
        this.writeByte(0);
    }

    private int32(num: i32, offset: i32 = -1): void {
        if (offset == -1) {
            // TODO: Grow buffer if needed
            offset = this.writeIndex;
            this.writeIndex += 4;
        }
        this.buffer[offset] = (num) & 0xff;
        this.buffer[offset + 1] = (num >>> 8) & 0xff;
        this.buffer[offset + 2] = (num >>> 16) & 0xff;
        this.buffer[offset + 3] = (num >>> 24) & 0xff;
    }

    private writeByte(b: u32): void {
        // TODO: Grow buffer if needed
        this.buffer[this.writeIndex++] = b;
    }
}


/*
function packElement(name: string, value: any, buffer: Uint8Array, writeIndex: number): number {
    if (value === undefined || value === null) {
        buffer[writeIndex++] = 0x0A;             // BSON type: Null
        writeIndex += cstring(name, buffer, writeIndex);
        return writeIndex;
    }
    switch (value.constructor) {
        case String:
            buffer[writeIndex++] = 0x02;           // BSON type: String
            writeIndex += cstring(name, buffer, writeIndex);
            let size = cstring(value, buffer, writeIndex + 4);
            writeIndex += int32(size, buffer, writeIndex);
            return writeIndex + size;

        case Number:
            if (Math.floor(value) === value) {
                if (value <= 2147483647 && value >= -2147483647) { /// = BSON.BSON_INT32_MAX / MIN asf.
                    buffer[writeIndex++] = 0x10;       // BSON type: int32
                    writeIndex += cstring(name, buffer, writeIndex);
                    writeIndex += int32(value, buffer, writeIndex);
                }
                else {
                    // TODO: Remove
                }
            }
            else {
                // it's a float / double
                buffer[writeIndex++] = 0x01;         // BSON type: 64-bit floating point
                writeIndex += cstring(name, buffer, writeIndex);
                let f = new Float64Array([value]);
                let d = new Uint8Array(f.buffer);
                buffer.set(d, writeIndex);
                writeIndex += 8;
            }
            return writeIndex;

        case Boolean:
            buffer[writeIndex++] = 0x08;           // BSON type: Boolean
            writeIndex += cstring(name, buffer, writeIndex);
            buffer[writeIndex++] = value ? 1 : 0;
            return writeIndex;

        case Array:
        case Object:
            buffer[writeIndex++] = value.constructor === Array ? 0x04 : 0x03;  // BSON type: Array / Document
            writeIndex += cstring(name, buffer, writeIndex);
            let end = serializeEx(value, buffer, writeIndex);
            int32(end - writeIndex, buffer, writeIndex);    // correct size
            return end;

        case Int8Array:
        case Uint8Array:
            buffer[writeIndex++] = 0x05;           // BSON type: Binary data
            writeIndex += cstring(name, buffer, writeIndex);
            writeIndex += int32(value.byteLength, buffer, writeIndex);
            buffer[writeIndex++] = 0;              // use generic binary subtype 0
            buffer.set(value, writeIndex);
            writeIndex += value.byteLength;
            return writeIndex;

        default:
            return writeIndex;                     // unknown type (ignore element)
    }
}
*/


