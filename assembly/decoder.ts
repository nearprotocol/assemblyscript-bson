declare function log(str: string): void;

export class BSONDecoder {

    deserialize(buffer: Uint8Array, i: number = 0): void {
        // check size
        if (buffer.length < 5) {
            // TODO: Report errors instead of just returning
            // Document error: Size < 5 bytes
            return;
        }
        let size = buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24;
        if (size < 5 || size > buffer.length) {
            // Document error: Size mismatch
            return;
        }
        if (buffer[buffer.length - 1] !== 0x00) {
            // Document error: Missing termination
            return;
        }

        for (; ;) {
            // get element type
            let elementType = buffer[i++];  // read type
            if (elementType === 0) break;   // zero means last byte, exit

            // get element name
            let end = i;
            for (; buffer[end] !== 0x00 && end < buffer.length; end++);
            if (end >= buffer.length - 1) {
                // Document error: Illegal key name
                return undefined;
            }
            let name = bin2str(buffer.subarray(i, end));
            i = ++end;                      // skip terminating zero

            switch (elementType) {
                case 0x02:                    // BSON type: String
                    size = buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24;
                    this.setString(name, bin2str(buffer.subarray(i, i += size - 1)));
                    i++;
                    break;

                case 0x03:                    // BSON type: Document (Object)
                    size = buffer[i] | buffer[i + 1] << 8 | buffer[i + 2] << 16 | buffer[i + 3] << 24;
                    this.pushObject(name);
                    this.deserialize(buffer, i);
                    this.popObject();
                    i += size;
                    break;

                case 0x04:                    // BSON type: Array
                    size = buffer[i] | buffer[i + 1] << 8 | buffer[i + 2] << 16 | buffer[i + 3] << 24;  // NO 'i' increment since the size bytes are reread during the recursion
                    this.pushArray(name);
                    this.deserialize(buffer, i);
                    this.popArray();
                    i += size;
                    break;

                case 0x05:                    // BSON type: Binary data
                    size = buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24;
                    if (buffer[i++] === 0x04) {
                        // BSON subtype: UUID (not supported)
                        return;
                    }
                    this.setUint8Array(name, buffer.slice(i, i += size));    // use slice() here to get a new array
                    break;

                case 0x08:                    // BSON type: Boolean
                    this.setBoolean(name, buffer[i++] === 1);
                    break;

                case 0x0A:                    // BSON type: Null
                    this.setNull(name);
                    break;

                case 0x10:                    // BSON type: 32-bit integer
                    this.setInteger(name, buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24);
                    break;

                default:
                    // Parsing error: Unknown element
                    return;
            }
        }
    }

    setString(name: string, value: string): void {
        log(name + ":" + value);
    }

    setBoolean(name: string, value: boolean): void {
        log(name + ":" + value);
    }

    setNull(name: string): void {
        log(name + ":null");
    }

    setInteger(name: string, value: i32): void {
        log(name + ":" + value);
    }

    setUint8Array(name: string, value: Uint8Array): void {
        log(name + ":" + value);
    }

    pushArray(name: string): void {
        log(name + ":[");
    }

    popArray(): void {
        log("]");
    }

    pushObject(name: string): void {
        log(name + ":{");
    }

    popObject(): void {
        log("}");
    }
}

/*
 * Parse byte array as an UTF-8 string
 * @param {Uint8Array} bin UTF-8 text given as array of bytes
 * @return {String} UTF-8 Text string
 */
export function bin2str(bin: Uint8Array): string {
    let str = '', len = bin.length, i = 0;
    let c: i32, c2: i32, c3: i32;

    while (i < len) {
        c = bin[i];
        if (c < 128) {
            str += String.fromCharCode(c);
            i++;
        }
        else if ((c > 191) && (c < 224)) {
            c2 = bin[i + 1];
            str += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        }
        else {
            c2 = bin[i + 1];
            c3 = bin[i + 2];
            str += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
    }
    return str;
}
