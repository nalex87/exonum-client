/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const expect = require('chai').expect
const Exonum = require('../../src')
const DataSchema = require('./data_schema/dataSchema').default
const cryptographyMock = require('./common_data/serialization/cryptography.json')
const invalidCryptographyMock = require('./common_data/serialization/cryptography-invalid.json')
const cryptography = require('./common_data/serialization/cryptography-config.json')
const schema = new DataSchema(cryptography)

describe('Check cryptography', function () {
  describe('Get SHA256 hash', function () {
    it('should return hash of data of newType type', function () {
      const hash = Exonum.hash(cryptographyMock.type1.data, schema.getType('type1'))
      expect(hash).to.equal(cryptographyMock.type1.hash)
    })

    it('should return hash of data of newType type using built-in method', function () {
      const hash = schema.getType('type2').hash(cryptographyMock.type2.data)
      expect(hash).to.equal(cryptographyMock.type2.hash)
    })

    it('should return hash of data of Transaction type', function () {
      const hash = Exonum.hash(cryptographyMock.type3.data, schema.getMessage('type3'))
      expect(hash).to.equal(cryptographyMock.type3.hash)
    })

    it('should return hash of data of Transaction type using built-in method', function () {
      const hash = schema.getMessage('type4').hash(cryptographyMock.type4.data)
      expect(hash).to.equal(cryptographyMock.type4.hash)
    })

    it('should return hash of the array of 8-bit integers', function () {
      const buffer = schema.getType('type5').serialize(cryptographyMock.type5.data)
      const hash = Exonum.hash(buffer)
      expect(hash).to.equal(cryptographyMock.type5.hash)
    })

    it('should throw error when data of invalid NewType type', function () {
      expect(() => Exonum.hash(undefined, schema.getType('type1')))
        .to.throw(TypeError, 'Cannot read property \'pub_key\' of undefined');

      [false, 42, new Date(), []].forEach(function (_hash) {
        expect(() => Exonum.hash(_hash, schema.getType('type1')))
          .to.throw(TypeError, 'Field pub_key is not defined.')
      })
    })

    it('should throw error when data of invalid Transaction type', function () {
      expect(() => Exonum.hash(undefined, schema.getMessage('type3')))
        .to.throw(TypeError, 'Cannot read property \'name\' of undefined');

      [false, 42, new Date(), []].forEach(function (_hash) {
        expect(() => Exonum.hash(_hash, schema.getMessage('type3')))
          .to.throw(TypeError, 'Field name is not defined.')
      })
    })
  })

  describe('Get ED25519 signature', function () {
    it('should return signature of the data of NewType type', function () {
      const signature = schema.getType('type6').sign(cryptographyMock.type6.secretKey, cryptographyMock.type6.data)
      expect(signature).to.equal(cryptographyMock.type6.signed)
    })

    it('should return signature of the data of NewType type using built-in method', function () {
      const signature = schema.getType('type6').sign(cryptographyMock.type6.secretKey, cryptographyMock.type6.data)
      expect(signature).to.equal(cryptographyMock.type6.signed)
    })

    it('should return signature of the data of Transaction type', function () {
      const signature = Exonum.sign(cryptographyMock.type7.secretKey, cryptographyMock.type7.data, schema.getMessage('type7'))
      expect(signature).to.equal(cryptographyMock.type7.signed)
    })

    it('should return signature of the data of Transaction type using built-in method', function () {
      const signature = schema.getMessage('type8').sign(cryptographyMock.type8.secretKey, cryptographyMock.type8.data)
      expect(signature).to.equal(cryptographyMock.type8.signed)
    })

    it('should return signature of the array of 8-bit integers', function () {
      const buffer = schema.getType('type9').serialize(cryptographyMock.type9.data)
      const signature = Exonum.sign(cryptographyMock.type9.secretKey, buffer)
      expect(signature).to.equal(cryptographyMock.type9.signed)
    })

    it('should throw error when the data parameter of wrong NewType type', function () {
      expect(() => Exonum.sign(invalidCryptographyMock.type6.secretKey, invalidCryptographyMock.type6.data, schema.getType('type6')))
        .to.throw(TypeError, 'Field firstName is not defined.')
    })

    it('should throw error when the data parameter of wrong Transaction type', function () {
      expect(() => Exonum.sign(invalidCryptographyMock.type7.secretKey, invalidCryptographyMock.type7.data, schema.getMessage('type7')))
        .to.throw(TypeError, 'Field name is not defined.')
    })

    it('should throw error when the type parameter of invalid type', function () {
      const secretKey = '6752be882314f5bbbc9a6af2ae634fc07038584a4a77510ea5eced45f54dc030f5864ab6a5a2190666b47c676bcf15a1f2f07703c5bcafb5749aa735ce8b7c36'
      const User = {
        alpha: 5
      }
      const userData = {
        firstName: 'John',
        lastName: 'Doe'
      }

      expect(() => Exonum.sign(secretKey, userData, User))
        .to.throw(TypeError, 'Wrong type of data.')
    })

    it('should throw error when the secretKey parameter of wrong length', function () {
      const buffer = schema.getType('type6').serialize(invalidCryptographyMock['type6-1'].data)
      expect(() => Exonum.sign(invalidCryptographyMock['type6-1'].secretKey, buffer))
        .to.throw(TypeError, 'secretKey of wrong type is passed. Hexadecimal expected.')
    })

    it('should throw error when wrong secretKey parameter', function () {
      const buffer = schema.getType('type6').serialize(invalidCryptographyMock['type6-2'].data)
      expect(() => Exonum.sign(invalidCryptographyMock['type6-2'].secretKey, buffer))
        .to.throw(TypeError, 'secretKey of wrong type is passed. Hexadecimal expected.')
    })

    it('should throw error when the secretKey parameter of invalid type', function () {
      const userData = {
        firstName: 'John',
        lastName: 'Doe'
      }
      const buffer = schema.getType('type6').serialize(userData);

      [true, null, undefined, [], {}, 51, new Date()].forEach(function (secretKey) {
        expect(() => Exonum.sign(secretKey, buffer))
          .to.throw(TypeError, 'secretKey of wrong type is passed. Hexadecimal expected.')
      })
    })
  })

  describe('Verify signature', function () {
    it('should verify signature of the data of NewType type and return true', function () {
      const publicKey = 'f5864ab6a5a2190666b47c676bcf15a1f2f07703c5bcafb5749aa735ce8b7c36'
      const signature = '7ccad21d76359c8c3ed1161eb8231edd44a91d53ea468d23f8528e2985e5547f72f98ccc61d96ecad173bdc29627abbf6d46908807f6dd0a0d767ae3887d040e'
      const User = Exonum.newType({
        fields: [
          { name: 'firstName', type: Exonum.String },
          { name: 'lastName', type: Exonum.String }
        ]
      })
      const userData = {
        firstName: 'John',
        lastName: 'Doe'
      }

      expect(User.verifySignature(signature, publicKey, userData)).to.be.true
    })

    it('should verify signature of the data of NewType type using built-in method and return true', function () {
      const publicKey = 'f5864ab6a5a2190666b47c676bcf15a1f2f07703c5bcafb5749aa735ce8b7c36'
      const signature = '7ccad21d76359c8c3ed1161eb8231edd44a91d53ea468d23f8528e2985e5547f72f98ccc61d96ecad173bdc29627abbf6d46908807f6dd0a0d767ae3887d040e'
      const User = Exonum.newType({
        fields: [
          { name: 'firstName', type: Exonum.String },
          { name: 'lastName', type: Exonum.String }
        ]
      })
      const userData = {
        firstName: 'John',
        lastName: 'Doe'
      }

      expect(User.verifySignature(signature, publicKey, userData)).to.be.true
    })

    it('should verify signature of the data of Transaction type and return true', function () {
      const publicKey = 'f5864ab6a5a2190666b47c676bcf15a1f2f07703c5bcafb5749aa735ce8b7c36'
      const signature = '856c7f680dd59fd0259c15add9e4cd558ec8ce375edb5efc7bbd646426d81f2b5cfa6eda76ea074646df27e4a2baf6831c5cddeb0ceb35c8c559392bf4427b04'
      const CustomMessage = Exonum.newTransaction({
        author: publicKey,
        service_id: 1,
        message_id: 0,
        fields: [
          { name: 'name', type: Exonum.String },
          { name: 'age', type: Exonum.Uint8 },
          { name: 'balance', type: Exonum.Uint64 },
          { name: 'status', type: Exonum.Bool }
        ]
      })
      const messageData = {
        name: 'John Doe',
        age: 34,
        balance: 173008,
        status: true
      }

      expect(Exonum.verifySignature(signature, publicKey, messageData, CustomMessage)).to.be.true
    })

    it('should verify signature of the data of Transaction type using built-in method and return true', function () {
      const publicKey = 'f5864ab6a5a2190666b47c676bcf15a1f2f07703c5bcafb5749aa735ce8b7c36'
      const signature = '856c7f680dd59fd0259c15add9e4cd558ec8ce375edb5efc7bbd646426d81f2b5cfa6eda76ea074646df27e4a2baf6831c5cddeb0ceb35c8c559392bf4427b04'
      const CustomMessage = Exonum.newTransaction({
        author: publicKey,
        service_id: 1,
        message_id: 0,
        fields: [
          { name: 'name', type: Exonum.String },
          { name: 'age', type: Exonum.Uint8 },
          { name: 'balance', type: Exonum.Uint64 },
          { name: 'status', type: Exonum.Bool }
        ]
      })
      const messageData = {
        name: 'John Doe',
        age: 34,
        balance: 173008,
        status: true
      }

      expect(CustomMessage.verifySignature(signature, publicKey, messageData)).to.be.true
    })

    it('should verify signature of the array of 8-bit integers', function () {
      const publicKey = 'f5864ab6a5a2190666b47c676bcf15a1f2f07703c5bcafb5749aa735ce8b7c36'
      const signature = '7ccad21d76359c8c3ed1161eb8231edd44a91d53ea468d23f8528e2985e5547f72f98ccc61d96ecad173bdc29627abbf6d46908807f6dd0a0d767ae3887d040e'
      const User = Exonum.newType({
        fields: [
          { name: 'firstName', type: Exonum.String },
          { name: 'lastName', type: Exonum.String }
        ]
      })
      const userData = {
        firstName: 'John',
        lastName: 'Doe'
      }
      const buffer = User.serialize(userData)

      expect(Exonum.verifySignature(signature, publicKey, buffer)).to.be.true
    })

    it('should verify signature of the array of 8-bit integers', function () {
      const publicKey = 'f5864ab6a5a2190666b47c676bcf15a1f2f07703c5bcafb5749aa735ce8b7c36'
      const signature = '7ccad21d76359c8c3ed1161eb8231edd44a91d53ea468d23f8528e2985e5547f72f98ccc61d96ecad173bdc29627abbf6d46908807f6dd0a0d767ae3887d040b'
      const User = Exonum.newType({
        fields: [
          { name: 'firstName', type: Exonum.String },
          { name: 'lastName', type: Exonum.String }
        ]
      })
      const userData = {
        firstName: 'John',
        lastName: 'Doe'
      }
      const buffer = User.serialize(userData)

      expect(Exonum.verifySignature(signature, publicKey, buffer)).to.be.false
    })

    it('should throw error when the data parameter is of wrong NewType type', function () {
      const publicKey = 'f5864ab6a5a2190666b47c676bcf15a1f2f07703c5bcafb5749aa735ce8b7c36'
      const signature = '9e0f0122c2963b76ba10842951cd1b67c8197b3f964c34f8b667aa655a7b4a8d844d567698d99de30590fc5002ddb4b9b5927ec05cd73572b972cb6b034cd40b'
      const userData = {
        sum: 500,
        hash: 'Hello world'
      }

      expect(() => Exonum.verifySignature(signature, publicKey, userData, schema.getType('type6')))
        .to.throw(TypeError, 'Field firstName is not defined.')
    })

    it('should throw error when the data parameter is of wrong Transaction type', function () {
      const publicKey = 'f5864ab6a5a2190666b47c676bcf15a1f2f07703c5bcafb5749aa735ce8b7c36'
      const signature = '24a5224702d670c95a78ef1f753c9e6e698da5b2a2c52dcc51b5bf9e556e717fb763b1a5e78bd39e5369a139ab68ae50dd19a129038e8da3af30985f09549500'
      const CustomMessage = Exonum.newTransaction({
        author: publicKey,
        service_id: 1,
        message_id: 0,
        fields: [
          { name: 'name', type: Exonum.String },
          { name: 'age', type: Exonum.Uint8 },
          { name: 'balance', type: Exonum.Uint64 },
          { name: 'status', type: Exonum.Bool }
        ]
      })
      const someData = {
        sum: 500,
        hash: 'Hello world'
      }

      expect(() => Exonum.verifySignature(signature, publicKey, someData, CustomMessage))
        .to.throw(TypeError, 'Field name is not defined.')
    })

    it('should throw error when the type parameter is of wrong type', function () {
      const publicKey = 'f5864ab6a5a2190666b47c676bcf15a1f2f07703c5bcafb5749aa735ce8b7c36'
      const signature = '9e0f0122c2963b76ba10842951cd1b67c8197b3f964c34f8b667aa655a7b4a8d844d567698d99de30590fc5002ddb4b9b5927ec05cd73572b972cb6b034cd40b'
      const User = {
        alpha: 3
      }
      const userData = {
        sum: 500,
        hash: 'Hello world'
      }

      expect(() => Exonum.verifySignature(signature, publicKey, userData, User))
        .to.throw(TypeError, 'Wrong type of data.')
    })

    it('should throw error when the signature parameter is of wrong length', function () {
      const publicKey = 'f5864ab6a5a2190666b47c676bcf15a1f2f07703c5bcafb5749aa735ce8b7c36'
      const signature = 'f5864ab6a5a2190666b47c676bcf15a1f2f07703c5bcafb5749aa735ce8b7c36'
      const User = Exonum.newType({
        fields: [
          { name: 'firstName', type: Exonum.String },
          { name: 'lastName', type: Exonum.String }
        ]
      })
      const userData = {
        firstName: 'John',
        lastName: 'Doe'
      }
      const buffer = User.serialize(userData)

      expect(() => Exonum.verifySignature(signature, publicKey, buffer))
        .to.throw(TypeError, 'Signature of wrong type is passed. Hexadecimal expected.')
    })

    it('should throw error when the signature parameter is invalid', function () {
      const publicKey = 'f5864ab6a5a2190666b47c676bcf15a1f2f07703c5bcafb5749aa735ce8b7c36'
      const signature = '6752be882314f5bbbc9a6af2ae634fc07038584a4a77510ea5eced45f54dc030f5864ab6a5a2190666b47c676bcf15a1f2f07703c5bcafb5749aa735ce8b7z'
      const User = Exonum.newType({
        fields: [
          { name: 'firstName', type: Exonum.String },
          { name: 'lastName', type: Exonum.String }
        ]
      })
      const userData = {
        firstName: 'John',
        lastName: 'Doe'
      }
      const buffer = User.serialize(userData)

      expect(() => Exonum.verifySignature(signature, publicKey, buffer))
        .to.throw(TypeError, 'Signature of wrong type is passed. Hexadecimal expected.')
    })

    it('should throw error when the signature parameter is of wrong type', function () {
      const publicKey = 'f5864ab6a5a2190666b47c676bcf15a1f2f07703c5bcafb5749aa735ce8b7c36'
      const User = Exonum.newType({
        fields: [
          { name: 'firstName', type: Exonum.String },
          { name: 'lastName', type: Exonum.String }
        ]
      })
      const userData = {
        firstName: 'John',
        lastName: 'Doe'
      }
      const buffer = User.serialize(userData);

      [true, null, undefined, [], {}, 51, new Date()].forEach(signature => {
        expect(() => Exonum.verifySignature(signature, publicKey, buffer))
          .to.throw(TypeError, 'Signature of wrong type is passed. Hexadecimal expected.')
      })
    })

    it('should throw error when the publicKey parameter is of wrong length', function () {
      const publicKey = '6752BE882314F5BBBC9A6AF2AE634FC07038584A4A77510EA5ECED45F54DC030F5864AB6A5A2190666B47C676BCF15A1F2F07703C5BCAFB5749AA735CE8B7C'
      const signature = '6752BE882314F5BBBC9A6AF2AE634FC07038584A4A77510EA5ECED45F54DC030F5864AB6A5A2190666B47C676BCF15A1F2F07703C5BCAFB5749AA735CE8B7C'
      const User = Exonum.newType({
        fields: [
          { name: 'firstName', type: Exonum.String },
          { name: 'lastName', type: Exonum.String }
        ]
      })
      const userData = {
        firstName: 'John',
        lastName: 'Doe'
      }
      const buffer = User.serialize(userData)

      expect(() => Exonum.verifySignature(signature, publicKey, buffer))
        .to.throw(TypeError, 'Signature of wrong type is passed. Hexadecimal expected.')
    })

    it('should throw error when the publicKey parameter is invalid', function () {
      const publicKey = 'F5864AB6A5A2190666B47C676BCF15A1F2F07703C5BCAFB5749AA735CE8B7C3Z'
      const signature = '6752BE882314F5BBBC9A6AF2AE634FC07038584A4A77510EA5ECED45F54DC030F5864AB6A5A2190666B47C676BCF15A1F2F07703C5BCAFB5749AA735CE8B7C'
      const User = Exonum.newType({
        fields: [
          { name: 'firstName', type: Exonum.String },
          { name: 'lastName', type: Exonum.String }
        ]
      })
      const userData = {
        firstName: 'John',
        lastName: 'Doe'
      }
      const buffer = User.serialize(userData)

      expect(() => Exonum.verifySignature(signature, publicKey, buffer))
        .to.throw(TypeError, 'Signature of wrong type is passed. Hexadecimal expected.')
    })

    it('should throw error when the publicKey parameter is of wrong type', function () {
      const signature = '6752BE882314F5BBBC9A6AF2AE634FC07038584A4A77510EA5ECED45F54DC030F5864AB6A5A2190666B47C676BCF15A1F2F07703C5BCAFB5749AA735CE8B7C'
      const User = Exonum.newType({
        fields: [
          { name: 'firstName', type: Exonum.String },
          { name: 'lastName', type: Exonum.String }
        ]
      })
      const userData = {
        firstName: 'John',
        lastName: 'Doe'
      }
      const buffer = User.serialize(userData);

      [true, null, undefined, [], {}, 51, new Date()].forEach(function (publicKey) {
        expect(() => Exonum.verifySignature(signature, publicKey, buffer))
          .to.throw(TypeError, 'Signature of wrong type is passed. Hexadecimal expected.')
      })
    })
  })

  describe('Generate key pair', function () {
    it('should generate random key pair of secret and public keys, serialize it and return serialized array', function () {
      const Type = Exonum.newType({
        fields: [
          { name: 'publicKey', type: Exonum.Hash },
          { name: 'secretKey', type: Exonum.Digest }
        ]
      })
      const data = Exonum.keyPair()
      const buffer = Type.serialize(data)

      expect(buffer.length).to.equal(96)
    })
  })

  describe('Generate random Uint64', function () {
    it('should generate random value of Uint64 type, serialize and return serialized array', function () {
      const Type = Exonum.newType({
        fields: [
          { name: 'balance', type: Exonum.Uint64 }
        ]
      })
      const data = { balance: Exonum.randomUint64() }
      const buffer = Type.serialize(data)

      expect(buffer.length).to.equal(8)
    })
  })
})
