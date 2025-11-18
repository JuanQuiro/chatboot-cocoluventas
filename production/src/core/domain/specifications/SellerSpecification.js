/**
 * Specification Pattern para Sellers
 * MEJORA: Queries complejas con specifications
 */

export class Specification {
    /**
     * Verificar si cumple la especificación
     * @param {Object} candidate
     * @returns {boolean}
     */
    isSatisfiedBy(candidate) {
        throw new Error('Method not implemented: isSatisfiedBy');
    }

    /**
     * AND lógico
     */
    and(other) {
        return new AndSpecification(this, other);
    }

    /**
     * OR lógico
     */
    or(other) {
        return new OrSpecification(this, other);
    }

    /**
     * NOT lógico
     */
    not() {
        return new NotSpecification(this);
    }
}

class AndSpecification extends Specification {
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
    }

    isSatisfiedBy(candidate) {
        return this.left.isSatisfiedBy(candidate) && 
               this.right.isSatisfiedBy(candidate);
    }
}

class OrSpecification extends Specification {
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
    }

    isSatisfiedBy(candidate) {
        return this.left.isSatisfiedBy(candidate) || 
               this.right.isSatisfiedBy(candidate);
    }
}

class NotSpecification extends Specification {
    constructor(spec) {
        super();
        this.spec = spec;
    }

    isSatisfiedBy(candidate) {
        return !this.spec.isSatisfiedBy(candidate);
    }
}

// Especificaciones concretas para Sellers

export class ActiveSellerSpecification extends Specification {
    isSatisfiedBy(seller) {
        return seller.active === true && seller.status !== 'offline';
    }
}

export class AvailableSellerSpecification extends Specification {
    isSatisfiedBy(seller) {
        return seller.currentClients < seller.maxClients;
    }
}

export class SpecialtySellerSpecification extends Specification {
    constructor(specialty) {
        super();
        this.specialty = specialty;
    }

    isSatisfiedBy(seller) {
        return seller.specialty === this.specialty;
    }
}

export class HighRatedSellerSpecification extends Specification {
    constructor(minRating = 4.5) {
        super();
        this.minRating = minRating;
    }

    isSatisfiedBy(seller) {
        return seller.rating >= this.minRating;
    }
}

export class LowLoadSellerSpecification extends Specification {
    constructor(maxLoadPercent = 50) {
        super();
        this.maxLoadPercent = maxLoadPercent;
    }

    isSatisfiedBy(seller) {
        const loadPercent = (seller.currentClients / seller.maxClients) * 100;
        return loadPercent <= this.maxLoadPercent;
    }
}
