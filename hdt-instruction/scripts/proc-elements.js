class ProcedureGroup extends HTMLElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-group", ProcedureGroup, { extends: "section" });
    }
}


class ProcedureGroupTitle extends HTMLHeadingElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-group-title", ProcedureGroupTitle, { extends: "h2" });
    }
}

class ProcedureContainer extends HTMLDivElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-container", ProcedureContainer, { extends: "div" });
    }
}

class ProcedureTitle extends HTMLHeadingElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-title", ProcedureTitle, { extends: "h3" });
    }
}

class ProcedureSteps extends HTMLOListElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-steps", ProcedureSteps, { extends: "ol" });
    }
}

class ProcedureStep extends HTMLLIElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-step", ProcedureStep, { extends: "li" });
    }
}


class ProcedureSubSteps extends HTMLLIElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-substeps", ProcedureSubSteps, { extends: "li" });
    }
}

class ProcedureSubStep extends HTMLLIElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-substep", ProcedureSubStep, { extends: "li" });
    }
}

class StepTitle extends HTMLHeadingElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-steptitle", StepTitle, { extends: "h3" });
    }
}


class StepDescription extends HTMLDivElement {
    constructor() {
        super();
    }

    static {
        customElements.define("proc-stepdesc", StepDescription, { extends: "div" });
    }
}

class ExpandableImage extends HTMLElement {
    constructor() {
        super();
        this.render();
    }

    render(){
        const imageUrl = this.getAttribute("src");

        const link = document.createElement("a");
        link.href = imageUrl;

        const image = document.createElement("img");
        image.src = imageUrl;
        link.appendChild(image);

        this.appendChild(link);
    }

    static {
        customElements.define("expandable-image", ExpandableImage);
    }
}