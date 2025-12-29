document.addEventListener('DOMContentLoaded', () => {

    // --- ФУНКЦИЯ ДЛЯ ПРИНУДИТЕЛЬНОЙ СТИЛИЗАЦИИ КРУГА (ФИНАЛЬНОЕ РЕШЕНИЕ) ---
    // Это обходит проблемы с приоритетами CSS и инлайн-стилями, которые устанавливает плагин.
    function applyPinkHandleStyle() {
        const pinkColor = '#ff7ab8';
        const styleId = 'twentytwenty-pink-fix';
        const handle = document.querySelector('#comparison-slider-new .twentytwenty-handle');

        // 1. Принудительная установка инлайн-стиля на сам элемент
        // Это перебьет любой инлайн-стиль background-color, установленный JS плагина.
        if (handle) {
            handle.style.backgroundColor = pinkColor;
        }

        // 2. Внедрение CSS-правил для псевдоэлементов (на случай, если фон задается ими)
        // Динамически внедренный CSS имеет высокий приоритет.
        let style = document.getElementById(styleId);
        if (style) {
            style.remove();
        }

        style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Перекрываем фон на псевдоэлементах */
            #comparison-slider-new .twentytwenty-handle:before,
            #comparison-slider-new .twentytwenty-handle:after {
                background: ${pinkColor} !important;
            }
        `;
        document.head.appendChild(style);
    }

    // --- Функция инициализации TwentyTwenty ---
    function initTwentyTwenty(containerId) {
        if (typeof jQuery !== 'undefined') {
            jQuery(document).ready(function ($) {
                $(containerId).twentytwenty({
                    default_offset_pct: 0.5, // Начинаем с 50%
                    before_label: 'ДО',
                    after_label: 'ПІСЛЯ',
                    no_overlay: true
                });

                // ВАЖНО: Вызов с задержкой, чтобы сработать после полной инициализации плагина
                setTimeout(applyPinkHandleStyle, 100);
            });
        }
    }

    // Инициализация при первой загрузке
    initTwentyTwenty("#comparison-slider-new");

    // --- Логика навигации снизу ---

    const navButtons = document.querySelectorAll('.portfolio-nav-btn');
    const sliderContainer = document.getElementById('comparison-slider-new');

    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const workId = e.target.getAttribute('data-work-id');

            // 1. Сброс/Установка активного класса
            navButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // 2. Смена изображений
            const images = sliderContainer.querySelectorAll('img');

            if (images.length === 2) {
                // Убедитесь, что пути к изображениям верны
                images[0].src = `source/image/result/before${workId}.jpg`;
                images[1].src = `source/image/result/after${workId}.jpg`;
            }

            // 3. ПЕРЕИНИЦИАЛИЗАЦИЯ TwentyTwenty для новых изображений
            if (typeof jQuery !== 'undefined') {
                // Уничтожаем старую инициализацию (важный шаг)
                $(sliderContainer).off('click').removeClass('twentytwenty-container');
                $(sliderContainer).find('.twentytwenty-wrapper, .twentytwenty-overlay, .twentytwenty-handle').remove();

                // Инициализируем плагин заново (это также вызовет applyPinkHandleStyle с задержкой)
                initTwentyTwenty(sliderContainer);
            }
        });
    });
});



// ===================================
// ЛОГІКА КВІЗУ З ПЛАВНОЮ АНІМАЦІЄЮ
// ===================================
document.addEventListener('DOMContentLoaded', () => {

    const optionButtons = document.querySelectorAll('#quiz-steps .option-btn');
    const retakeButton = document.querySelector('.btn-retake-test');
    const recommendedServiceElement = document.getElementById('recommended-service');
    const telegramLink = document.getElementById('telegram-link');
    
    // quizStepsContainer оголошено, але логіка висоти видалена
    const quizStepsContainer = document.getElementById('quiz-steps'); 
    let userAnswers = {};

    // Карта результатів: [Ключ результату]: { Назва_Послуги: "...", Telegram_Повідомлення: "..." }
    const resultsMap = {
        'RESULT-KERATIN': { name: "Кератин", msg: "Я пройшов тест і мені рекомендовано Кератин." },
        'RESULT-BOTOX': { name: "Ботокс", msg: "Я пройшов тест і мені рекомендовано Ботокс." },
        'RESULT-RECONSTRUCTION': { name: "Реконструкція", msg: "Я пройшов тест і мені рекомендовано Реконструкція." },
        'RESULT-PEELING': { name: "Пілінг", msg: "Я пройшов тест і мені рекомендовано Пілінг." },
    };

    // !!! ВСТАВТЕ СВІЙ TELEGRAM-ЛОГІН ТУТ !!!
    const TELEGRAM_USERNAME = "tsofaaa";

    // ----------------------------------------------------
    // ФУНКЦІЯ ПОКАЗУ РЕЗУЛЬТАТУ
    // ----------------------------------------------------
    function showResult(resultKey) {
        const resultData = resultsMap[resultKey];
        const resultStep = document.getElementById('step-result');

        if (resultData) {
            recommendedServiceElement.textContent = resultData.name;
            const telegramURL = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(resultData.msg)}`;
            telegramLink.href = telegramURL;
        }

        // Приховуємо всі кроки та плавно показуємо результат
        document.querySelectorAll('.quiz-step').forEach(step => step.classList.remove('active'));
        
        // Невелика затримка, щоб кроки повністю зникли перед появою результату
        setTimeout(() => {
            resultStep.classList.add('active');
        }, 50);
    }

    // ----------------------------------------------------
    // ОБРОБНИК КНОПОК
    // ----------------------------------------------------
    optionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const currentStep = button.closest('.quiz-step');
            const nextStepId = button.getAttribute('data-next-step');

            userAnswers[currentStep.id] = button.getAttribute('data-answer');

            // Встановлення активного стану для стилізації
            currentStep.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');

            // Плавне приховування поточного кроку
            currentStep.classList.remove('active');

            // Затримка для завершення CSS-анімації (400 мс)
            setTimeout(() => {

                if (nextStepId.startsWith('RESULT-')) {
                    showResult(nextStepId);
                } else {
                    const nextStep = document.getElementById(`step-${nextStepId}`);
                    if (nextStep) {
                        nextStep.classList.add('active');
                    }
                }

                // Знімаємо клас 'selected' після переходу
                button.classList.remove('selected');
                
                // >>> Видалено логіку: quizStepsContainer.style.height = 'auto';

            }, 400);
        });
    });

    // ----------------------------------------------------
    // ЛОГІКА ПОВТОРНОГО ПРОХОДЖЕННЯ
    // ----------------------------------------------------
    if (retakeButton) {
        retakeButton.addEventListener('click', () => {
            const resultStep = document.getElementById('step-result');

            // >>> Видалено логіку фіксації висоти

            resultStep.classList.remove('active');

            setTimeout(() => {
                userAnswers = {};
                document.getElementById('step-1').classList.add('active');
                optionButtons.forEach(btn => btn.classList.remove('selected'));
                
                // >>> Видалено логіку скидання висоти
                
            }, 400);
        });
    }

});