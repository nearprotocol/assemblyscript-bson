import 'allocator/arena';

import { BSONDecoder } from "../../assembly/decoder";

/*
let deserialize_vector = [
    {
        obj: { "BSON": ["awesome", 5.05, 1986] },
        bson: "310000000442534f4e002600000002300008000000617765736f6d65000131003333333333331440103200c20700000000",
    },
    {
        obj: { arr: ["foo", "bar", 100, 1000], ta: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), obj: { int32: 10, int64: 1125899906842624, flo: 3.141592653 } },
        bson: "7500000004617272002900000002300004000000666f6f00023100040000006261720010320064000000103300e8030000000574610008000000000102030405060708036f626a002c00000010696e743332000a00000012696e74363400000000000000040001666c6f0038e92f54fb2109400000"
    },
    {
        obj: { id: 123456, sk: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), pk: new Uint8Array([255, 254, 253, 252, 251, 250, 249, 248]) },
        bson: "2f0000001069640040e2010005736b000800000000010203040506070805706b000800000000fffefdfcfbfaf9f800"
    },
];
*/

export class StringConversionTests {
    static shouldConvertToDecimalString1(): bool {
        return false;
    }

    static createDecoder(): BSONDecoder {
        return new BSONDecoder();
    }

    static shouldHandleEmptyObject(): bool {
        this.createDecoder().deserialize(hex2bin("0500000000"));
        // expect(obj).to.deep.equal({ });
        return true;
    }
  
    static shouldHandleInt32(): bool {
        this.createDecoder().deserialize(hex2bin("0e00000010696e74003412000000"));
        //expect(obj).to.deep.equal({ int: 0x1234 });
        return true;
    }
  
    /*
      it("checks negative int32", function () {
        this.createDecoder().deserialize(hex2bin("0e00000010696e7400f6ffffff00"));
        expect(obj).to.deep.equal({ int: -10 });
      });
  
      it("checks int64", function () {
        this.createDecoder().deserialize(hex2bin("1200000012696e7400907856341200000000"));
        expect(obj).to.deep.equal({ int: 0x1234567890 });
      });
  
      it("checks int64 > 2^53", function () {
        this.createDecoder().deserialize(hex2bin("1200000012696e7400FFDEBC9A7856341200"));
        expect(obj).to.deep.equal({ int: 0x123456789ABCDEFF });
      });
  
      it("checks negative int64", function () {
        this.createDecoder().deserialize(hex2bin("1200000012696e74007087a9cbedffffff00"));
        expect(obj).to.deep.equal({ int: -78187493520 });
      });
  
      it("checks double (64-bit binary floating point)", function () {
        this.createDecoder().deserialize(hex2bin("1200000001666c6f0044174154fb21094000"));
        expect(obj).to.deep.equal({ flo: 3.1415926535 });
      });
     */
  
    static shouldHandleString(): bool {
        this.createDecoder().deserialize(hex2bin("1a00000002737472000c00000048656c6c6f20576f726c640000"));
        // expect(obj).to.deep.equal({ str: "Hello World" });
        return true;
    }
  
     /*
      it("checks UTF-8 string", function () {
        this.createDecoder().deserialize(hex2bin("17000000027374720009000000c384c396c39cc39f0000"));
        expect(obj).to.deep.equal({ str: "\u00C4\u00D6\u00DC\u00DF" });
      });
  
      it("checks boolean", function () {
        this.createDecoder().deserialize(hex2bin("0c00000008626f6f6c000000"));
        expect(obj).to.deep.equal({ bool: false });
        obj = BSON.deserialize(hex2bin("0c00000008626f6f6c000100"));
        expect(obj).to.deep.equal({ bool: true });
      });
  
      it("checks null", function () {
        this.createDecoder().deserialize(hex2bin("0a0000000a6e756c0000"));
        expect(obj).to.deep.equal({ nul: null });
      });
  
      it("checks binary", function () {
        this.createDecoder().deserialize(hex2bin("190000000562696e000a00000000010203040506070809ff00"));
        expect(obj).to.deep.equal({ bin: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0xFF]) });
      });
  
      it("checks array", function () {
        this.createDecoder().deserialize(hex2bin("2b000000046172720021000000103000fa000000103100fb000000103200fc000000103300fd0000000000"));
        expect(obj).to.deep.equal({ arr: [0xFA, 0xFB, 0xFC, 0xFD] });
      });
  
      it("checks array in array", function () {
        this.createDecoder().deserialize(hex2bin("4f000000046172720045000000043000210000001030001000000010310011000000103200120000001033001300000000103100fa000000103200fb000000103300fc000000103400fd0000000000"));
        expect(obj).to.deep.equal({ arr: [[0x10, 0x11, 0x12, 0x13], 0xFA, 0xFB, 0xFC, 0xFD] });
      });
  
      it("checks object", function () {
        this.createDecoder().deserialize(hex2bin("22000000036f626a001800000010696e74000a000000027374720001000000000000"));
        expect(obj).to.deep.equal({ obj: { int: 10, str: "" } });
      });
  
      it("checks complex objects", function () {
        for (let i = 0; i < deserialize_vector.length; i++) {
          let bson = BSON.serialize(deserialize_vector[i].obj);
          this.createDecoder().deserialize(hex2bin(deserialize_vector[i].bson), true);
          expect(obj).to.deep.equal(deserialize_vector[i].obj);
        }
      });
  
      it("checks document too small", function () {
        this.createDecoder().deserialize(hex2bin("04000000"));
        expect(obj).to.equal(undefined);
      });
  
      it("checks document termination", function () {
        this.createDecoder().deserialize(hex2bin("0c00000008626f6f6c000001"));
        expect(obj).to.equal(undefined);
        obj = BSON.deserialize(hex2bin("0c00000008626f6f6c0000"));
        expect(obj).to.equal(undefined);
      });
  
      it("checks document size mismatch", function () {
        this.createDecoder().deserialize(hex2bin("0d00000008626f6f6c000000"));
        expect(obj).to.equal(undefined);
      });
  
      it("checks illegal keyname", function () {
        this.createDecoder().deserialize(hex2bin("0c00000008626f6f6c010100"));
        expect(obj).to.equal(undefined);
      });
  
      it("checks unknown element", function () {
        this.createDecoder().deserialize(hex2bin("0c00000018626f6f6c000000"));
        expect(obj).to.equal(undefined);
      });

    */
}

function hex2bin(hex: string): Uint8Array {
    let bin = new Uint8Array(hex.length >>> 1);
    for (let i = 0, len = hex.length >>> 1; i < len; i++) {
        bin[i] = u32(parseInt(hex.substr(i << 1, 2), 16));
    }
    return bin;
}