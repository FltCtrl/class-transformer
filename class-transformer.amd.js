define("class-transformer/ClassTransformOptions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("class-transformer/metadata/ExposeExcludeOptions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("class-transformer/metadata/TypeMetadata", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TypeMetadata = (function () {
        function TypeMetadata(target, propertyName, reflectedType, typeFunction) {
            this.target = target;
            this.propertyName = propertyName;
            this.reflectedType = reflectedType;
            this.typeFunction = typeFunction;
        }
        return TypeMetadata;
    }());
    exports.TypeMetadata = TypeMetadata;
});
define("class-transformer/metadata/ExposeMetadata", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExposeMetadata = (function () {
        function ExposeMetadata(target, propertyName, options) {
            this.target = target;
            this.propertyName = propertyName;
            this.options = options;
        }
        return ExposeMetadata;
    }());
    exports.ExposeMetadata = ExposeMetadata;
});
define("class-transformer/metadata/ExcludeMetadata", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExcludeMetadata = (function () {
        function ExcludeMetadata(target, propertyName, options) {
            this.target = target;
            this.propertyName = propertyName;
            this.options = options;
        }
        return ExcludeMetadata;
    }());
    exports.ExcludeMetadata = ExcludeMetadata;
});
define("class-transformer/metadata/TransformMetadata", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TransformMetadata = (function () {
        function TransformMetadata(target, propertyName, transformFn, options) {
            this.target = target;
            this.propertyName = propertyName;
            this.transformFn = transformFn;
            this.options = options;
        }
        return TransformMetadata;
    }());
    exports.TransformMetadata = TransformMetadata;
});
define("class-transformer/metadata/MetadataStorage", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Storage all library metadata.
     */
    var MetadataStorage = (function () {
        function MetadataStorage() {
            // -------------------------------------------------------------------------
            // Properties
            // -------------------------------------------------------------------------
            this._typeMetadatas = [];
            this._transformMetadatas = [];
            this._exposeMetadatas = [];
            this._excludeMetadatas = [];
        }
        // -------------------------------------------------------------------------
        // Adder Methods
        // -------------------------------------------------------------------------
        MetadataStorage.prototype.addTypeMetadata = function (metadata) {
            this._typeMetadatas.push(metadata);
        };
        MetadataStorage.prototype.addTransformMetadata = function (metadata) {
            this._transformMetadatas.push(metadata);
        };
        MetadataStorage.prototype.addExposeMetadata = function (metadata) {
            this._exposeMetadatas.push(metadata);
        };
        MetadataStorage.prototype.addExcludeMetadata = function (metadata) {
            this._excludeMetadatas.push(metadata);
        };
        // -------------------------------------------------------------------------
        // Public Methods
        // -------------------------------------------------------------------------
        MetadataStorage.prototype.findTransformMetadatas = function (target, propertyName, transformationType) {
            return this.findMetadatas(this._transformMetadatas, target, propertyName)
                .filter(function (metadata) {
                if (!metadata.options)
                    return true;
                if (metadata.options.toClassOnly === true && metadata.options.toPlainOnly === true)
                    return true;
                if (metadata.options.toClassOnly === true) {
                    return transformationType === "classToClass" || transformationType === "plainToClass";
                }
                if (metadata.options.toPlainOnly === true) {
                    return transformationType === "classToPlain";
                }
                return true;
            });
        };
        MetadataStorage.prototype.findExcludeMetadata = function (target, propertyName) {
            return this.findMetadata(this._excludeMetadatas, target, propertyName);
        };
        MetadataStorage.prototype.findExposeMetadata = function (target, propertyName) {
            return this.findMetadata(this._exposeMetadatas, target, propertyName);
        };
        MetadataStorage.prototype.findExposeMetadataByCustomName = function (target, name) {
            return this._exposeMetadatas.find(function (metadata) {
                return metadata.target === target && metadata.options && metadata.options.name === name;
            });
        };
        MetadataStorage.prototype.findTypeMetadata = function (target, propertyName) {
            return this.findMetadata(this._typeMetadatas, target, propertyName);
        };
        MetadataStorage.prototype.getStrategy = function (target) {
            var exclude = this._excludeMetadatas.find(function (metadata) { return metadata.target === target && metadata.propertyName === undefined; });
            var expose = this._exposeMetadatas.find(function (metadata) { return metadata.target === target && metadata.propertyName === undefined; });
            if ((exclude && expose) || (!exclude && !expose))
                return "none";
            return exclude ? "excludeAll" : "exposeAll";
        };
        MetadataStorage.prototype.getExposedMetadatas = function (target) {
            return this.getMetadata(this._exposeMetadatas, target);
        };
        MetadataStorage.prototype.getExcludedMetadatas = function (target) {
            return this.getMetadata(this._excludeMetadatas, target);
        };
        MetadataStorage.prototype.getExposedProperties = function (target, transformationType) {
            return this.getExposedMetadatas(target)
                .filter(function (metadata) {
                if (!metadata.options)
                    return true;
                if (metadata.options.toClassOnly === true && metadata.options.toPlainOnly === true)
                    return true;
                if (metadata.options.toClassOnly === true) {
                    return transformationType === "classToClass" || transformationType === "plainToClass";
                }
                if (metadata.options.toPlainOnly === true) {
                    return transformationType === "classToPlain";
                }
                return true;
            })
                .map(function (metadata) { return metadata.propertyName; });
        };
        MetadataStorage.prototype.getExcludedProperties = function (target, transformationType) {
            return this.getExcludedMetadatas(target)
                .filter(function (metadata) {
                if (!metadata.options)
                    return true;
                if (metadata.options.toClassOnly === true && metadata.options.toPlainOnly === true)
                    return true;
                if (metadata.options.toClassOnly === true) {
                    return transformationType === "classToClass" || transformationType === "plainToClass";
                }
                if (metadata.options.toPlainOnly === true) {
                    return transformationType === "classToPlain";
                }
                return true;
            })
                .map(function (metadata) { return metadata.propertyName; });
        };
        MetadataStorage.prototype.clear = function () {
            this._typeMetadatas = [];
            this._exposeMetadatas = [];
            this._excludeMetadatas = [];
        };
        // -------------------------------------------------------------------------
        // Private Methods
        // -------------------------------------------------------------------------
        MetadataStorage.prototype.getMetadata = function (metadatas, target) {
            var metadataFromTarget = metadatas.filter(function (meta) { return meta.target === target && meta.propertyName !== undefined; });
            var metadataFromChildren = metadatas.filter(function (meta) { return target.prototype instanceof meta.target && meta.propertyName !== undefined; });
            return metadataFromChildren.concat(metadataFromTarget);
        };
        MetadataStorage.prototype.findMetadata = function (metadatas, target, propertyName) {
            var metadataFromTarget = metadatas.find(function (meta) { return meta.target === target && meta.propertyName === propertyName; });
            var metadataFromChildren = metadatas.find(function (meta) { return target.prototype instanceof meta.target && meta.propertyName === propertyName; });
            return metadataFromTarget || metadataFromChildren;
        };
        MetadataStorage.prototype.findMetadatas = function (metadatas, target, propertyName) {
            var metadataFromTarget = metadatas.filter(function (meta) { return (target === undefined || meta.target === target) && meta.propertyName === propertyName; });
            var metadataFromChildren = metadatas.filter(function (meta) { return target && target.prototype instanceof meta.target && meta.propertyName === propertyName; });
            return metadataFromChildren.reverse().concat(metadataFromTarget.reverse());
        };
        return MetadataStorage;
    }());
    exports.MetadataStorage = MetadataStorage;
});
define("class-transformer/storage", ["require", "exports", "class-transformer/metadata/MetadataStorage"], function (require, exports, MetadataStorage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Default metadata storage is used as singleton and can be used to storage all metadatas.
     */
    exports.defaultMetadataStorage = new MetadataStorage_1.MetadataStorage();
});
define("class-transformer/TransformOperationExecutor", ["require", "exports", "class-transformer/storage"], function (require, exports, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TransformOperationExecutor = (function () {
        // -------------------------------------------------------------------------
        // Constructor
        // -------------------------------------------------------------------------
        function TransformOperationExecutor(transformationType, options) {
            this.transformationType = transformationType;
            this.options = options;
            // -------------------------------------------------------------------------
            // Private Properties
            // -------------------------------------------------------------------------
            this.transformedTypes = [];
        }
        // -------------------------------------------------------------------------
        // Public Methods
        // -------------------------------------------------------------------------
        TransformOperationExecutor.prototype.transform = function (source, value, targetType, arrayType, isMap, level) {
            var _this = this;
            if (level === void 0) { level = 0; }
            if (value instanceof Array || value instanceof Set) {
                var newValue_1 = arrayType && this.transformationType === "plainToClass" ? new arrayType() : [];
                value.forEach(function (subValue, index) {
                    var subSource = source ? source[index] : undefined;
                    if (!_this.isCircular(subValue, level)) {
                        var value_1 = _this.transform(subSource, subValue, targetType, undefined, subValue instanceof Map, level + 1);
                        if (newValue_1 instanceof Set) {
                            newValue_1.add(value_1);
                        }
                        else {
                            newValue_1.push(value_1);
                        }
                    }
                    else if (_this.transformationType === "classToClass") {
                        if (newValue_1 instanceof Set) {
                            newValue_1.add(subValue);
                        }
                        else {
                            newValue_1.push(subValue);
                        }
                    }
                });
                return newValue_1;
            }
            else if (targetType === String && !isMap) {
                return String(value);
            }
            else if (targetType === Number && !isMap) {
                return Number(value);
            }
            else if (targetType === Boolean && !isMap) {
                return Boolean(value);
            }
            else if ((targetType === Date || value instanceof Date) && !isMap) {
                if (value instanceof Date) {
                    return new Date(value.valueOf());
                }
                if (value === null || value === undefined)
                    return value;
                return new Date(value);
            }
            else if (value instanceof Object) {
                // try to guess the type
                if (!targetType && value.constructor !== Object /* && operationType === "classToPlain"*/)
                    targetType = value.constructor;
                if (!targetType && source)
                    targetType = source.constructor;
                // add transformed type to prevent circular references
                this.transformedTypes.push({ level: level, object: value });
                var keys = this.getKeys(targetType, value);
                var newValue = source ? source : {};
                if (!source && (this.transformationType === "plainToClass" || this.transformationType === "classToClass")) {
                    if (isMap) {
                        newValue = new Map();
                    }
                    else if (targetType) {
                        newValue = new targetType();
                    }
                    else {
                        newValue = {};
                    }
                }
                var _loop_1 = function (key) {
                    var valueKey = key, newValueKey = key, propertyName = key;
                    if (!this_1.options.ignoreDecorators && targetType) {
                        if (this_1.transformationType === "plainToClass") {
                            var exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadataByCustomName(targetType, key);
                            if (exposeMetadata) {
                                propertyName = exposeMetadata.propertyName;
                                newValueKey = exposeMetadata.propertyName;
                            }
                        }
                        else if (this_1.transformationType === "classToPlain" || this_1.transformationType === "classToClass") {
                            var exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(targetType, key);
                            if (exposeMetadata && exposeMetadata.options && exposeMetadata.options.name)
                                newValueKey = exposeMetadata.options.name;
                        }
                    }
                    // get a subvalue
                    var subValue = undefined;
                    if (value instanceof Map) {
                        subValue = value.get(valueKey);
                    }
                    else if (value[valueKey] instanceof Function) {
                        subValue = value[valueKey]();
                    }
                    else {
                        subValue = value[valueKey];
                    }
                    // determine a type
                    var type = undefined, isSubValueMap = subValue instanceof Map;
                    if (targetType && isMap) {
                        type = targetType;
                    }
                    else if (targetType) {
                        var metadata = storage_1.defaultMetadataStorage.findTypeMetadata(targetType, propertyName);
                        if (metadata) {
                            var options = { newObject: newValue, object: value, property: propertyName };
                            type = metadata.typeFunction(options);
                            isSubValueMap = isSubValueMap || metadata.reflectedType === Map;
                        }
                        else if (this_1.options.targetMaps) {
                            this_1.options.targetMaps
                                .filter(function (map) { return map.target === targetType && !!map.properties[propertyName]; })
                                .forEach(function (map) { return type = map.properties[propertyName]; });
                        }
                    }
                    // if value is an array try to get its custom array type
                    var arrayType_1 = value[valueKey] instanceof Array ? this_1.getReflectedType(targetType, propertyName) : undefined;
                    // const subValueKey = operationType === "plainToClass" && newKeyName ? newKeyName : key;
                    var subSource = source ? source[valueKey] : undefined;
                    // if its deserialization then type if required
                    // if we uncomment this types like string[] will not work
                    // if (this.transformationType === "plainToClass" && !type && subValue instanceof Object && !(subValue instanceof Date))
                    //     throw new Error(`Cannot determine type for ${(targetType as any).name }.${propertyName}, did you forget to specify a @Type?`);
                    // if newValue is a source object that has method that match newKeyName then skip it
                    if (newValue.constructor.prototype) {
                        var descriptor = Object.getOwnPropertyDescriptor(newValue.constructor.prototype, newValueKey);
                        if ((this_1.transformationType === "plainToClass" || this_1.transformationType === "classToClass")
                            && (newValue[newValueKey] instanceof Function || (descriptor && !descriptor.set)))
                            return "continue";
                    }
                    if (!this_1.isCircular(subValue, level)) {
                        var transformKey = this_1.transformationType === "plainToClass" ? newValueKey : key;
                        var finalValue = this_1.transform(subSource, subValue, type, arrayType_1, isSubValueMap, level + 1);
                        finalValue = this_1.applyCustomTransformations(finalValue, targetType, transformKey);
                        if (newValue instanceof Map) {
                            newValue.set(newValueKey, finalValue);
                        }
                        else {
                            newValue[newValueKey] = finalValue;
                        }
                    }
                    else if (this_1.transformationType === "classToClass") {
                        var finalValue = subValue;
                        finalValue = this_1.applyCustomTransformations(finalValue, targetType, key);
                        if (newValue instanceof Map) {
                            newValue.set(newValueKey, finalValue);
                        }
                        else {
                            newValue[newValueKey] = finalValue;
                        }
                    }
                };
                var this_1 = this;
                // traverse over keys
                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                    var key = keys_1[_i];
                    _loop_1(key);
                }
                return newValue;
            }
            else {
                return value;
            }
        };
        TransformOperationExecutor.prototype.applyCustomTransformations = function (value, target, key) {
            var _this = this;
            var metadatas = storage_1.defaultMetadataStorage.findTransformMetadatas(target, key, this.transformationType);
            // apply versioning options
            if (this.options.version !== undefined) {
                metadatas = metadatas.filter(function (metadata) {
                    if (!metadata.options)
                        return true;
                    return _this.checkVersion(metadata.options.since, metadata.options.until);
                });
            }
            // apply grouping options
            if (this.options.groups && this.options.groups.length) {
                metadatas = metadatas.filter(function (metadata) {
                    if (!metadata.options)
                        return true;
                    return _this.checkGroups(metadata.options.groups);
                });
            }
            else {
                metadatas = metadatas.filter(function (metadata) {
                    return !metadata.options ||
                        !metadata.options.groups ||
                        !metadata.options.groups.length;
                });
            }
            metadatas.forEach(function (metadata) {
                value = metadata.transformFn(value);
            });
            return value;
        };
        // preventing circular references
        TransformOperationExecutor.prototype.isCircular = function (object, level) {
            return !!this.transformedTypes.find(function (transformed) { return transformed.object === object && transformed.level < level; });
        };
        TransformOperationExecutor.prototype.getReflectedType = function (target, propertyName) {
            if (!target)
                return undefined;
            var meta = storage_1.defaultMetadataStorage.findTypeMetadata(target, propertyName);
            return meta ? meta.reflectedType : undefined;
        };
        TransformOperationExecutor.prototype.getKeys = function (target, object) {
            var _this = this;
            // determine exclusion strategy
            var strategy = storage_1.defaultMetadataStorage.getStrategy(target);
            if (strategy === "none")
                strategy = this.options.strategy || "exposeAll"; // exposeAll is default strategy
            // get all keys that need to expose
            var keys = [];
            if (strategy === "exposeAll") {
                if (object instanceof Map) {
                    keys = Array.from(object.keys());
                }
                else {
                    keys = Object.keys(object);
                }
            }
            if (!this.options.ignoreDecorators && target) {
                // add all exposed to list of keys
                var exposedProperties = storage_1.defaultMetadataStorage.getExposedProperties(target, this.transformationType);
                if (this.transformationType === "plainToClass") {
                    exposedProperties = exposedProperties.map(function (key) {
                        var exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(target, key);
                        if (exposeMetadata && exposeMetadata.options && exposeMetadata.options.name) {
                            return exposeMetadata.options.name;
                        }
                        return key;
                    });
                }
                keys = keys.concat(exposedProperties);
                // exclude excluded properties
                var excludedProperties_1 = storage_1.defaultMetadataStorage.getExcludedProperties(target, this.transformationType);
                if (excludedProperties_1.length > 0) {
                    keys = keys.filter(function (key) {
                        return excludedProperties_1.indexOf(key) === -1;
                    });
                }
                // apply versioning options
                if (this.options.version !== undefined) {
                    keys = keys.filter(function (key) {
                        var exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(target, key);
                        if (!exposeMetadata || !exposeMetadata.options)
                            return true;
                        return _this.checkVersion(exposeMetadata.options.since, exposeMetadata.options.until);
                    });
                }
                // apply grouping options
                if (this.options.groups && this.options.groups.length) {
                    keys = keys.filter(function (key) {
                        var exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(target, key);
                        if (!exposeMetadata || !exposeMetadata.options)
                            return true;
                        return _this.checkGroups(exposeMetadata.options.groups);
                    });
                }
                else {
                    keys = keys.filter(function (key) {
                        var exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(target, key);
                        return !exposeMetadata ||
                            !exposeMetadata.options ||
                            !exposeMetadata.options.groups ||
                            !exposeMetadata.options.groups.length;
                    });
                }
            }
            // exclude prefixed properties
            if (this.options.excludePrefixes && this.options.excludePrefixes.length) {
                keys = keys.filter(function (key) { return _this.options.excludePrefixes.every(function (prefix) {
                    return key.substr(0, prefix.length) !== prefix;
                }); });
            }
            // make sure we have unique keys
            keys = keys.filter(function (key, index, self) {
                return self.indexOf(key) === index;
            });
            return keys;
        };
        TransformOperationExecutor.prototype.checkVersion = function (since, until) {
            var decision = true;
            if (decision && since)
                decision = this.options.version >= since;
            if (decision && until)
                decision = this.options.version < until;
            return decision;
        };
        TransformOperationExecutor.prototype.checkGroups = function (groups) {
            if (!groups)
                return true;
            return this.options.groups.some(function (optionGroup) { return groups.indexOf(optionGroup) !== -1; });
        };
        return TransformOperationExecutor;
    }());
    exports.TransformOperationExecutor = TransformOperationExecutor;
});
define("class-transformer/ClassTransformer", ["require", "exports", "class-transformer/TransformOperationExecutor"], function (require, exports, TransformOperationExecutor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ClassTransformer = (function () {
        function ClassTransformer() {
        }
        ClassTransformer.prototype.classToPlain = function (object, options) {
            var executor = new TransformOperationExecutor_1.TransformOperationExecutor("classToPlain", options || {});
            return executor.transform(undefined, object, undefined, undefined, undefined, undefined);
        };
        ClassTransformer.prototype.classToPlainFromExist = function (object, plainObject, options) {
            var executor = new TransformOperationExecutor_1.TransformOperationExecutor("classToPlain", options || {});
            return executor.transform(plainObject, object, undefined, undefined, undefined, undefined);
        };
        ClassTransformer.prototype.plainToClass = function (cls, plain, options) {
            var executor = new TransformOperationExecutor_1.TransformOperationExecutor("plainToClass", options || {});
            return executor.transform(undefined, plain, cls, undefined, undefined, undefined);
        };
        ClassTransformer.prototype.plainToClassFromExist = function (clsObject, plain, options) {
            var executor = new TransformOperationExecutor_1.TransformOperationExecutor("plainToClass", options || {});
            return executor.transform(clsObject, plain, undefined, undefined, undefined, undefined);
        };
        ClassTransformer.prototype.classToClass = function (object, options) {
            var executor = new TransformOperationExecutor_1.TransformOperationExecutor("classToClass", options || {});
            return executor.transform(undefined, object, undefined, undefined, undefined, undefined);
        };
        ClassTransformer.prototype.classToClassFromExist = function (object, fromObject, options) {
            var executor = new TransformOperationExecutor_1.TransformOperationExecutor("classToClass", options || {});
            return executor.transform(fromObject, object, undefined, undefined, undefined, undefined);
        };
        ClassTransformer.prototype.serialize = function (object, options) {
            return JSON.stringify(this.classToPlain(object, options));
        };
        /**
         * Deserializes given JSON string to a object of the given class.
         */
        ClassTransformer.prototype.deserialize = function (cls, json, options) {
            var jsonObject = JSON.parse(json);
            return this.plainToClass(cls, jsonObject, options);
        };
        /**
         * Deserializes given JSON string to an array of objects of the given class.
         */
        ClassTransformer.prototype.deserializeArray = function (cls, json, options) {
            var jsonObject = JSON.parse(json);
            return this.plainToClass(cls, jsonObject, options);
        };
        return ClassTransformer;
    }());
    exports.ClassTransformer = ClassTransformer;
});
define("class-transformer/decorators", ["require", "exports", "class-transformer/ClassTransformer", "class-transformer/storage", "class-transformer/metadata/TypeMetadata", "class-transformer/metadata/ExposeMetadata", "class-transformer/metadata/ExcludeMetadata", "class-transformer/metadata/TransformMetadata"], function (require, exports, ClassTransformer_1, storage_2, TypeMetadata_1, ExposeMetadata_1, ExcludeMetadata_1, TransformMetadata_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Defines a custom logic for value transformation.
     */
    function Transform(transformFn, options) {
        return function (target, key) {
            var metadata = new TransformMetadata_1.TransformMetadata(target.constructor, key, transformFn, options);
            storage_2.defaultMetadataStorage.addTransformMetadata(metadata);
        };
    }
    exports.Transform = Transform;
    /**
     * Specifies a type of the property.
     */
    function Type(typeFunction) {
        return function (target, key) {
            var type = Reflect.getMetadata("design:type", target, key);
            var metadata = new TypeMetadata_1.TypeMetadata(target.constructor, key, type, typeFunction);
            storage_2.defaultMetadataStorage.addTypeMetadata(metadata);
        };
    }
    exports.Type = Type;
    /**
     * Marks property as included in the process of transformation. By default it includes the property for both
     * constructorToPlain and plainToConstructor transformations, however you can specify on which of transformation types
     * you want to skip this property.
     */
    function Expose(options) {
        return function (object, propertyName) {
            var metadata = new ExposeMetadata_1.ExposeMetadata(object instanceof Function ? object : object.constructor, propertyName, options || {});
            storage_2.defaultMetadataStorage.addExposeMetadata(metadata);
        };
    }
    exports.Expose = Expose;
    /**
     * Marks property as excluded from the process of transformation. By default it excludes the property for both
     * constructorToPlain and plainToConstructor transformations, however you can specify on which of transformation types
     * you want to skip this property.
     */
    function Exclude(options) {
        return function (object, propertyName) {
            var metadata = new ExcludeMetadata_1.ExcludeMetadata(object instanceof Function ? object : object.constructor, propertyName, options || {});
            storage_2.defaultMetadataStorage.addExcludeMetadata(metadata);
        };
    }
    exports.Exclude = Exclude;
    /**
     * Transform the object from class to plain object and return only with the exposed properties.
     */
    function TransformClassToPlain(params) {
        return function (target, propertyKey, descriptor) {
            var classTransformer = new ClassTransformer_1.ClassTransformer();
            var originalMethod = descriptor.value;
            descriptor.value = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var result = originalMethod.apply(this, args);
                var isPromise = !!result && (typeof result === "object" || typeof result === "function") && typeof result.then === "function";
                return isPromise ? result.then(function (data) { return classTransformer.classToPlain(data, params); }) : classTransformer.classToPlain(result, params);
            };
        };
    }
    exports.TransformClassToPlain = TransformClassToPlain;
    /**
     * Return the class instance only with the exposed properties.
     */
    function TransformClassToClass(params) {
        return function (target, propertyKey, descriptor) {
            var classTransformer = new ClassTransformer_1.ClassTransformer();
            var originalMethod = descriptor.value;
            descriptor.value = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var result = originalMethod.apply(this, args);
                var isPromise = !!result && (typeof result === "object" || typeof result === "function") && typeof result.then === "function";
                return isPromise ? result.then(function (data) { return classTransformer.classToClass(data, params); }) : classTransformer.classToClass(result, params);
            };
        };
    }
    exports.TransformClassToClass = TransformClassToClass;
});
define("class-transformer/index", ["require", "exports", "class-transformer/ClassTransformer", "class-transformer/ClassTransformer", "class-transformer/decorators"], function (require, exports, ClassTransformer_2, ClassTransformer_3, decorators_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClassTransformer = ClassTransformer_3.ClassTransformer;
    __export(decorators_1);
    var classTransformer = new ClassTransformer_2.ClassTransformer();
    function classToPlain(object, options) {
        return classTransformer.classToPlain(object, options);
    }
    exports.classToPlain = classToPlain;
    function classToPlainFromExist(object, plainObject, options) {
        return classTransformer.classToPlainFromExist(object, plainObject, options);
    }
    exports.classToPlainFromExist = classToPlainFromExist;
    function plainToClass(cls, plain, options) {
        return classTransformer.plainToClass(cls, plain, options);
    }
    exports.plainToClass = plainToClass;
    function plainToClassFromExist(clsObject, plain, options) {
        return classTransformer.plainToClassFromExist(clsObject, plain, options);
    }
    exports.plainToClassFromExist = plainToClassFromExist;
    function classToClass(object, options) {
        return classTransformer.classToClass(object, options);
    }
    exports.classToClass = classToClass;
    function classToClassFromExist(object, fromObject, options) {
        return classTransformer.classToClassFromExist(object, fromObject, options);
    }
    exports.classToClassFromExist = classToClassFromExist;
    function serialize(object, options) {
        return classTransformer.serialize(object, options);
    }
    exports.serialize = serialize;
    /**
     * Deserializes given JSON string to a object of the given class.
     */
    function deserialize(cls, json, options) {
        return classTransformer.deserialize(cls, json, options);
    }
    exports.deserialize = deserialize;
    /**
     * Deserializes given JSON string to an array of objects of the given class.
     */
    function deserializeArray(cls, json, options) {
        return classTransformer.deserializeArray(cls, json, options);
    }
    exports.deserializeArray = deserializeArray;
});
define("class-transformer", ["require", "exports", "class-transformer/index"], function (require, exports, index_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(index_1);
});
