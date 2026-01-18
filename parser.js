// @todo: напишите здесь код парсера

function parseHead() {
    let metaInfo = {
        title: '',
        description: '',
        keywords: [],
        language: '',
        opengraph: {},
    };
    const head = document.head;

    const title = head.querySelector('title');
    if (title) {
        metaInfo.title = title.textContent.split('—')[0].trim();
    }

    const description = head.querySelector('meta[name="description"]');
    if (description.content) {
        metaInfo.description = description.content.trim();
    }

    const keyWords = head.querySelector('meta[name="keywords"]');
    if (keyWords.content) {
        metaInfo.keywords = keyWords.content
            .split(',')
            .map((words) => words.trim());
    }

    metaInfo.language = document.querySelector('html').lang ?? '';

    const ogTags = head.querySelectorAll('meta[property^="og:"]');
    ogTags.forEach((ogTag) => {
        let propName = ogTag.getAttribute('property').slice(3);
        if (propName === 'title') {
            metaInfo.opengraph[propName] =
                ogTag.content?.split('—')[0].trim() ?? '';
        } else {
            metaInfo.opengraph[propName] = ogTag.content ?? '';
        }
    });

    return metaInfo;
}

function parseProductSection() {
    let productInfo = {
        id: '',
        name: '',
        isLiked: false,
        tags: {},
        price: null,
        oldPrice: null,
        discount: null,
        discountPercent: '',
        properties: {},
        description: '',
        images: [],
    };
    const prodSection = document.querySelector('.product');

    productInfo.id = prodSection.dataset.id ?? '';

    productInfo.name = prodSection.querySelector('h1').textContent.trim() ?? '';

    const buttonLike = prodSection.querySelector('button.like');
    if (buttonLike) {
        productInfo.isLiked = buttonLike.classList.contains('active');
    }

    const tags = prodSection.querySelectorAll('.about .tags span');
    tags.forEach((spanTag) => {
        let className = spanTag.className,
            tagContent = spanTag.textContent.trim();

        if (className === 'green') {
            if (!productInfo.tags.category) productInfo.tags.category = [];
            productInfo.tags.category.push(tagContent);
        } else if (className === 'blue') {
            if (!productInfo.tags.label) productInfo.tags.label = [];
            productInfo.tags.label.push(tagContent);
        } else {
            if (!productInfo.tags.discount) productInfo.tags.discount = [];
            productInfo.tags.discount.push(tagContent);
        }
    });

    const prices = prodSection.querySelector('.about .price');
    productInfo.price = +prices.firstChild.textContent.trim().slice(1);
    productInfo.oldPrice = +prices.firstElementChild.textContent
        .trim()
        .slice(1);

    return productInfo;
}

function parsePage() {
    return {
        meta: parseHead(),
        product: parseProductSection(),
        suggested: [],
        reviews: [],
    };
}

window.parsePage = parsePage;
