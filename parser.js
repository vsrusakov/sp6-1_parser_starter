// @todo: напишите здесь код парсера

function parseCurrency(currencyLabel) {
    switch (currencyLabel) {
        case '₽':
            return 'RUB';
        case '€':
            return 'EUR';
        case '$':
            return 'USD';
        default:
            return null;
    }
}

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
    metaInfo.title = title?.textContent.split('—')[0].trim() ?? '';

    const description = head.querySelector('meta[name="description"]');
    metaInfo.description = description.content.trim();

    const keyWords = head.querySelector('meta[name="keywords"]');
    metaInfo.keywords = keyWords.content
        .split(',')
        .map((words) => words.trim());

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
        currency: '',
        properties: {},
        description: '',
        images: [],
    };
    const prodSection = document.querySelector('#app main .product');

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

    productInfo.discount = productInfo.oldPrice - productInfo.price;

    productInfo.discountPercent = productInfo.discount
        ? ((1 - productInfo.price / productInfo.oldPrice) * 100).toFixed(2) +
          '%'
        : '0%';

    const currencyLabel = prices.firstChild.textContent.trim().slice(0, 1);
    productInfo.currency = parseCurrency(currencyLabel) ?? '';

    prodSection
        .querySelectorAll('.about .properties li')
        ?.forEach((propertyLi) => {
            let key = propertyLi.firstElementChild?.textContent ?? '',
                value = propertyLi.children[1]?.textContent ?? '';

            productInfo.properties[key] = value;
        });

    let descriptionDiv = prodSection.querySelector('.about .description');
    let description = descriptionDiv?.children;

    for (let i = 0; i < description.length; i++) {
        while (description[i].attributes.length > 0) {
            description[i].removeAttribute(description[i].attributes[0].name);
        }
    }

    productInfo.description = descriptionDiv.innerHTML.trim();

    const images = prodSection.querySelectorAll('.preview nav button');

    images.forEach((imgButton) => {
        const imgTag = imgButton.querySelector('img');
        const imgObj = {
            preview: imgTag.src?.trim() ?? '',
            full: imgTag.dataset.src?.trim() ?? '',
            alt: imgTag.alt?.trim() ?? '',
        };

        if (imgButton.hasAttribute('disabled')) {
            productInfo.images.unshift(imgObj);
        } else {
            productInfo.images.push(imgObj);
        }
    });

    return productInfo;
}

function parseSuggested() {
    const suggestedInfo = [];
    const suggestedItems = document.querySelectorAll(
        '#app main .suggested .container .items article'
    );

    suggestedItems.forEach((item) => {
        const itemObj = {};
        const priceWithLabel =
            item.querySelector('b')?.textContent.trim() ?? '';

        itemObj.name = item.querySelector('h3')?.textContent.trim() ?? '';
        itemObj.description = item.querySelector('p')?.textContent.trim() ?? '';
        itemObj.image = item.querySelector('img')?.src.trim() ?? '';
        itemObj.price = priceWithLabel.slice(1);
        itemObj.currency = parseCurrency(priceWithLabel.slice(0, 1)) ?? '';

        suggestedInfo.push(itemObj);
    });
    return suggestedInfo;
}

function parseReviews() {
    const reviewsInfo = [];
    const reviewsItems = document.querySelectorAll(
        '#app main .reviews .container .items article'
    );

    reviewsItems.forEach((review) => {
        const reviewObj = {};
        const rating =
            review.querySelectorAll('.rating span[class="filled"]')?.length ??
            0;
        const authorInfo = review.querySelector('.author');

        reviewObj.rating = rating;
        reviewObj.author = {
            avatar: authorInfo.querySelector('img')?.src.trim() ?? '',
            name: authorInfo.querySelector('span')?.textContent.trim() ?? '',
        };
        reviewObj.title = review.querySelector('div .title').textContent.trim();
        reviewObj.description = review
            .querySelector('div p')
            .textContent.trim();
        reviewObj.date =
            authorInfo
                .querySelector('i')
                ?.textContent.trim()
                .replaceAll('/', '.') ?? '';
        reviewsInfo.push(reviewObj);
    });
    return reviewsInfo;
}

function parsePage() {
    return {
        meta: parseHead(),
        product: parseProductSection(),
        suggested: parseSuggested(),
        reviews: parseReviews(),
    };
}

window.parsePage = parsePage;
