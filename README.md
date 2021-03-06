# Good one Slider

![Карусель](https://cs7055.userapi.com/c636625/v636625473/525ad/60RGkUCfLLw.jpg)

*Good one Slider* или коротко *Goos*, это очень простая карусель/слайдер/галерея, которая не требует никаких зависимостей,
очень мало весит, прекрасно работает на любых устройствах и очень просто настраивается.
 
#### Основные отличительные черты:
- Все визуальные настройки только в CSS
- Все анимации только в CSS
- Вычисление размеров браузер производит самостоятельно на основе стилей
- Нет вычислений в скриптах, поэтому нет тормозов при ресайзе
- Вся адаптивность через медиа-выражения 
- Изменение количества видимых элементов не ломает логику скриптов
- Нативные события на мобильных устройствах
- Деградирует до нативного скролла, если нет скриптов или что-то пошло не так
- Без проблем инициализируется из скрытого элемента
- Можно добавлять новые элементы во время анимации
- Легко расширяется и допиливается под свои нужды

#### Минусы:
- Вам нужно знать CSS.

## Полезные ссылки
- [Демо](https://baribadamshin.github.io/goos/demo/)
- [Документация](https://github.com/baribadamshin/goos/wiki)

### Установка
- Правильный способ: `npm install goos`
- [Скачать архивом](https://github.com/baribadamshin/goos/releases)

## Быстрый старт

#### Подключение
Goos собран как универсальный модуль &mdash; [UMD](https://github.com/umdjs/umd) 

```html
<!-- самый простой вариант -->
<link href="path/to/goos.min.css" rel="stylesheet" />
<script src="path/to/goos.min.js"></script>


<!-- модуль -->
const goos = require('goos'); 
```

#### Разметка
Если вы знакомы с методологией [БЭМ](https://ru.bem.info), разобраться будет очень просто.
```html
<!--
    goos, goos__shaft, goos__item — обязательны
    goos_size_4 - количество видимых элементов; сейчас доступно от 2-х до 7, если не указывать — 1
    goos_margin - добавит расстояние между элементами, по умолчанию 14px
    goos_responsive - адаптивность
    
    вы можете дополнить или переопределить следующие классы
    goos_size_4, goos_margin, goos_responsive
     
    за подробной информацией обратитесь к документации 
-->

<div class="goos goos_margin goos_responsive goos_size_4">
    <ul class="goos__shaft">
        <!-- вместо div.snippet может быть любой контент -->
        <li class="goos__item"><div class="snippet">1</div>
        <li class="goos__item"><div class="snippet">2</div>
        <li class="goos__item"><div class="snippet">3</div>
        <!-- ... -->
        <li class="goos__item"><div class="snippet">30</div>
    </ul>
</div>
```

#### Инициализация
После подключения библиотеки, вам будет доступна глобальная функция `goos(blocks, [options])`
```html
<script>
    /**
     * @param {HtmlElement|HTMLCollection|NodeList} - DOM элемент(ы)
     * @param {Object} - опции
     */
    goos(document.querySelectorAll('.goos'), {
        current: 0, // активный элемент, по умолчанию первый
        enableArrows: true, // нарисовать стрелки, по умолчанию false
        enableDots: true, // количество экранов в виде точек под слайдером, по умолчанию false
        size: 4, // количество видимых элементов, по умолчанию используется значение из класса goos_size_{n}, либо 1,
        slideBy: 4, // по умолчанию равно size
    });
</script>
```

## Самостоятельная сборка
1. Форкнуть или клонировать репозиторий
2. `npm install`
3. `npm run build`

## Лицензия
MIT License
