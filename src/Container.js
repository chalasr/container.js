import ContainerNotFoundError from './ContainerNotFoundError';
import ContainerDuplicateError from './ContainerDuplicateError';

/**
 * Microscopic dependency injection container
 */
class Container {
  /**
   * Contructor
   */
  constructor() {
    this.cache = new Map();
    this.services = new Map();
    this.parameters = new Map();

    this.resolve = this.resolve.bind(this);
    this.fetch = this.fetch.bind(this);
  }

  /**
   * Register parameter or service
   *
   * @param {String} name
   * @param {Scalar|Function} value
   * @param {Array} dependencies
   * @param {String} tag
   * @param {Boolean} shared
   */
  register(name, value, dependencies = [], tag = null, shared = true) {
    if (Container.isConstructor(value)) {
      this.registerDefinition(name, value, dependencies, tag, shared);
    } else {
      this.registerParameter(name, value);
    }
  }

  /**
   * Register service definition
   *
   * @param {String} name
   * @param {Function} classname
   * @param {Array} dependencies
   * @param {String} tag
   * @param {Boolean} shared
   */
  registerDefinition(name, classname, dependencies = [], tag = null, shared = true) {
    this.ensureUniqueness(name);
    this.services.set(name, { classname, name, dependencies, tag });
  }

  /**
   * Register parameter
   *
   * @param {String} name
   * @param {mixed} value
   */
  registerParameter(name, value) {
    this.ensureUniqueness(name);
    this.parameters.set(name, value);
  }

  /**
   * Ensure that the given key is not used by a definition or a parameter
   *
   * @param {String} name
   *
   * @throw {ContainerDuplicateError}
   */
  ensureUniqueness(name) {
    if (this.parameters.has(name)) {
      throw new ContainerDuplicateError(name, 'parameter');
    }

    if (this.services.has(name)) {
      throw new ContainerDuplicateError(name, 'service');
    }
  }

  /**
   * Fetch parameter or service
   *
   * @param {String} name
   *
   * @return {mixed}
   */
  fetch(name) {
    if (this.services.has(name)) {
      return this.resolve(this.services.get(name));
    }

    if (this.parameters.has(name)) {
      return this.parameters.get(name);
    }

    throw new ContainerNotFoundError(name);
  }

  /**
   * Get tagged service
   *
   * @param {String} tag
   *
   * @return {Array}
   */
  getTaggedService(tag) {
    return Array
      .from(this.services.values())
      .filter(definition => definition.tag === tag)
    ;
  }

  /**
   * Resolve definition
   *
   * @param {Object} definition
   *
   * @return {mixed}
   */
  resolve(definition) {
    const shared = definition.shared;

    if (shared && this.cache.has(name)) {
        return this.cache.get(name);
    }

    const dependencies = definition.dependencies.map(this.fetch);
    const Constructor = definition.classname;
    const service = new Constructor(...dependencies);

    if (shared) {
        this.cache.set(definition.name, service);
    }

    return service;
  }

  /**
   * Is the given function a class constructor?
   *
   * @param {Function} classname
   *
   * @return {Boolean}
   */
  static isConstructor(classname) {
    return typeof (classname) === 'function' && classname.name !== '';
  }
}

export default Container;
