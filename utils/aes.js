

/*
 * http://point-at-infinity.org/jsaes/
 *
 * This is a javascript implementation of the AES block cipher. Key lengths 
 * of 128, 192 and 256 bits are supported.
 *
 * The well-functioning of the encryption/decryption routines has been 
 * verified for different key lengths with the test vectors given in 
 * FIPS-197, Appendix C.
 *
 * The following code example enciphers the plaintext block '00 11 22 .. EE FF'
 * with the 256 bit key '00 01 02 .. 1E 1F'.
 *
 *    AES_Init();
 *
 *    var block = new Array(16);
 *    for(var i = 0; i < 16; i++)
 *        block[i] = 0x11 * i;
 *
 *    var key = new Array(32);
 *    for(var i = 0; i < 32; i++)
 *        key[i] = i;
 *
 *    AES_ExpandKey(key);
 *    AES_Encrypt(block, key);
 *
 *    AES_Done();
 *
 * Report bugs to: jsaes AT point-at-infinity.org
 *
 */

/******************************************************************************/

/* 
   AES_Init: initialize the tables needed at runtime. Call this function
   before the (first) key expansion.
*/

const AES_Sbox = [99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,
  118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,
  147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,
  7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,
  47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,208,239,170,
  251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,
  188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,
  100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,
  50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,
  78,169,108,86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,
  116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,
  158,225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,140,161,
  137,13,191,230,66,104,65,153,45,15,176,84,187,22];

const AES_ShiftRowTab = [0,5,10,15,4,9,14,3,8,13,2,7,12,1,6,11];

class AESBlock {

  constructor() {
    this.AES_Sbox_Inv = new Array(256);
    for(let i = 0; i < 256; i++)
      this.AES_Sbox_Inv[AES_Sbox[i]] = i;

    this.AES_ShiftRowTab_Inv = new Array(16);
    for(let i = 0; i < 16; i++)
      this.AES_ShiftRowTab_Inv[AES_ShiftRowTab[i]] = i;

    this.AES_xtime = new Array(256);
    for(let i = 0; i < 128; i++) {
      this.AES_xtime[i] = i << 1;
      this.AES_xtime[128 + i] = (i << 1) ^ 0x1b;
    }
  }

  expandKey(key) {
    let kl = key.length, ks, Rcon = 1;
    switch (kl) {
      case 16: ks = 16 * (10 + 1); break;
      case 24: ks = 16 * (12 + 1); break;
      case 32: ks = 16 * (14 + 1); break;
      default:
        console.error("AES_ExpandKey: Only key lengths of 16, 24 or 32 bytes allowed!");
        return;
    }
    for(var i = kl; i < ks; i += 4) {
      var temp = key.slice(i - 4, i);
      if (i % kl == 0) {
        temp = [AES_Sbox[temp[1]] ^ Rcon, AES_Sbox[temp[2]],
          AES_Sbox[temp[3]], AES_Sbox[temp[0]]];
        if ((Rcon <<= 1) >= 256)
          Rcon ^= 0x11b;
      }
      else if ((kl > 24) && (i % kl == 16))
        temp = [AES_Sbox[temp[0]], AES_Sbox[temp[1]],
          AES_Sbox[temp[2]], AES_Sbox[temp[3]]];
      for(var j = 0; j < 4; j++)
        key[i + j] = key[i + j - kl] ^ temp[j];
    }
  }

  encrypt(block, key) {
    var l = key.length;
    this.addRoundKey(block, key.slice(0, 16));
    for(var i = 16; i < l - 16; i += 16) {
      this.subBytes(block, AES_Sbox);
      this.shiftRows(block, AES_ShiftRowTab);
      this.mixColumns(block);
      this.addRoundKey(block, key.slice(i, i + 16));
    }
    this.subBytes(block, AES_Sbox);
    this.shiftRows(block, AES_ShiftRowTab);
    this.addRoundKey(block, key.slice(i, l));
  }

  decrypt(block, key) {
    var l = key.length;
    this.addRoundKey(block, key.slice(l - 16, l));
    this.shiftRows(block, this.AES_ShiftRowTab_Inv);
    this.subBytes(block, this.AES_Sbox_Inv);
    for(var i = l - 32; i >= 16; i -= 16) {
      this.addRoundKey(block, key.slice(i, i + 16));
      this.mixColumns_Inv(block);
      this.shiftRows(block, this.AES_ShiftRowTab_Inv);
      this.subBytes(block, this.AES_Sbox_Inv);
    }
    this.addRoundKey(block, key.slice(0, 16));
  }

  subBytes(state, sbox) {
    for(var i = 0; i < 16; i++)
      state[i] = sbox[state[i]];
  }

  addRoundKey(state, rkey) {
    for(var i = 0; i < 16; i++)
      state[i] ^= rkey[i];
  }

  shiftRows(state, shifttab) {
    var h = [].concat(state);
    for(var i = 0; i < 16; i++)
      state[i] = h[shifttab[i]];
  }

  mixColumns(state) {
    for(var i = 0; i < 16; i += 4) {
      var s0 = state[i + 0], s1 = state[i + 1];
      var s2 = state[i + 2], s3 = state[i + 3];
      var h = s0 ^ s1 ^ s2 ^ s3;
      state[i + 0] ^= h ^ this.AES_xtime[s0 ^ s1];
      state[i + 1] ^= h ^ this.AES_xtime[s1 ^ s2];
      state[i + 2] ^= h ^ this.AES_xtime[s2 ^ s3];
      state[i + 3] ^= h ^ this.AES_xtime[s3 ^ s0];
    }
  }

  mixColumns_Inv(state) {
    for(var i = 0; i < 16; i += 4) {
      var s0 = state[i + 0], s1 = state[i + 1];
      var s2 = state[i + 2], s3 = state[i + 3];
      var h = s0 ^ s1 ^ s2 ^ s3;
      var xh = this.AES_xtime[h];
      var h1 = this.AES_xtime[this.AES_xtime[xh ^ s0 ^ s2]] ^ h;
      var h2 = this.AES_xtime[this.AES_xtime[xh ^ s1 ^ s3]] ^ h;
      state[i + 0] ^= h1 ^ this.AES_xtime[s0 ^ s1];
      state[i + 1] ^= h2 ^ this.AES_xtime[s1 ^ s2];
      state[i + 2] ^= h1 ^ this.AES_xtime[s2 ^ s3];
      state[i + 3] ^= h2 ^ this.AES_xtime[s3 ^ s0];
    }
  }
}

let AES128ECB1Block = {

  /**
   *
   * @param {Array} plainbuffer  len = 16
   * @param {string}cipher
   */

  encrypt(plainbuffer, cipher) {
    let key = new Array(16);
    let i = 0;
    for (; i < cipher.length && i < 16; ++i) {
      key[i] = cipher.charCodeAt(i);
    }
    for (; i < 16; ++i) {
      key[i] = 48; //  '0'
    }

    let aes = new AESBlock();
    aes.expandKey(key);
    aes.encrypt(plainbuffer, key);
  },

  /**
   *
   * @param {Array} cipherbuffer  len = 16
   * @param {string}cipher
   */

  decrypt(cipherbuffer, cipher) {
    let key = new Array(16);
    let i = 0;
    for (; i < cipher.length && i < 16; ++i) {
      key[i] = cipher.charCodeAt(i);
    }
    for (; i < 16; ++i) {
      key[i] = 48; //  '0'
    }

    let aes = new AESBlock();
    aes.expandKey(key);
    aes.decrypt(cipherbuffer, key);
  },

  /**
   *
   * @param {Array} plainbuffer  len = 16
   * @param {Array}cipher len = 16
   */
  encrypt16(plainbuffer, cipher) {
    let aes = new AESBlock();
    let key = cipher.concat();
    aes.expandKey(key);
    aes.encrypt(plainbuffer, key);
  },

  /**
   *
   * @param {Array} cipherbuffer  len = 16
   * @param {Array}cipher len = 16
   */
  decrypt16(cipherbuffer, cipher) {
    let aes = new AESBlock();
    let key = cipher.concat();
    aes.expandKey(key);
    aes.decrypt(cipherbuffer, key);
  },
};

module.exports = AES128ECB1Block;
