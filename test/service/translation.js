'use strict';

var assert = require('chai').assert;
var fs = require('fs');

var TranslationService = require('../../dist/script/service/translation');
var TranslationModel = require('../../dist/script/model/translation');
var TranslationItemModel = require('../../dist/script/model/translationItem');
var TranslationFileModel = require('../../dist/script/model/translationFile');

describe('translationService', function() {
  var service;
  before(function() {
    service = new TranslationService.default();
  });

  it('should return JSON data as a translation model', function() {
    //TODO: add test for category.
    var values = {"fileName": "value1", "otherFileName": "value2"};
    var item = new TranslationItemModel.default("id", "key1", values);
    var translation = new TranslationModel.default("id", "Default", [], [item]);

    var json = service.getJSON(translation, "fileName");
    assert.isObject(json);
    assert.property(json, "key1");
    assert.propertyVal(json, "key1", "value1");
  });

  it('should add key in translation model', function() {
  });

  it('should parse JSON data to translation model', function(done) {
    fs.readFile('test/fixture/translation.json', 'utf8', (err, data) => {
      if (err) throw err;

      var json = JSON.parse(data);
      var file = new TranslationFileModel.default("fileName", "uuid", json);
      var translation = service.parse(file);
      assert.isNotNull(translation);
      assert.isArray(translation.categories);
      assert.isArray(translation.items);

      var item = translation.items[0];
      assert.isNotNull(item);
      assert.equal("key1", item.key);
      assert.include("fileName", item.values);

      var value = item.values["fileName"];
      assert.equal("value1", value);

      var category = translation.categories[0];
      assert.isNotNull(category);
      assert.equal("category1", category.name);
      assert.isNotNull(category.items);

      var categoryItem = category.items[0];
      assert.isNotNull(categoryItem);
      assert.equal("key4", categoryItem.key);
      assert.include("fileName", categoryItem.values);

      var categoryValue = categoryItem.values["fileName"];
      assert.equal("value4", categoryValue);
      done();
    });
  });

  it('should remove file in translation model', function() {

  });
});
