
    function showNotification(type) {
    // type: 'unlock' 或 'locked'
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) existingNotif.remove();
    
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    
    if (type === 'unlock') {
        notif.innerHTML = `
            <div class="notif-header">
                <span class="notif-icon">🎉</span>
                <span class="notif-title">解锁成功！</span>
            </div>
            <div class="notif-body">
                所有题库和顺序模式已解锁<br>
                无需答题即可使用全部功能
            </div>
            <button class="notif-btn" onclick="this.closest('.notification').remove()">确定</button>
        `;
    } else {
        notif.innerHTML = `
            <div class="notif-header">
                <span class="notif-icon">🔒</span>
                <span class="notif-title">尚未解锁</span>
            </div>
            <div class="notif-body">
                需要完成「赵宇真爱粉测试」并获得满分<br>
                才能解锁顺序模式和全部题库
            </div>
            <button class="notif-btn" onclick="this.closest('.notification').remove()">知道了</button>
        `;
    }
    
    document.body.appendChild(notif);
    
    // 5秒后自动关闭
    setTimeout(() => {
        if (notif.parentNode) {
            notif.style.animation = 'slideOut 0.5s ease-out forwards';
            setTimeout(() => notif.remove(), 500);
        }
    }, 5000);
}

document.addEventListener('contextmenu', e => e.preventDefault());

document.addEventListener('copy', e => e.preventDefault());

document.addEventListener('cut', e => e.preventDefault());


document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
    }
});

        // 全局变量
        let currentExamData = null;
        let isRandomMode = true;
        let currentExamFile = '';
        let errorCounts = {};
        let isZhaoYuUnlocked = false; // 赵宇测试是否已解锁
        let zhaoYuPerfectScoreAchieved = false; // 本次赵宇测试是否已达成满分

        const ERROR_STORAGE_PREFIX = 'test_error_counts_';
        const UNLOCK_STORAGE_KEY = 'zhaoyu_unlocked_status';

        // --- 初始化：检查解锁状态 ---
        function checkAndApplyUnlockStatus() {
            const storedUnlock = localStorage.getItem(UNLOCK_STORAGE_KEY);
            if (storedUnlock === 'true') {
                isZhaoYuUnlocked = true;
                unlockOtherExams();
                enableOrderMode();
            } else {
                lockOtherExams();
                disableOrderMode();
            }
        }

        // --- 解锁/锁定其他题库 ---
        function unlockOtherExams() {
            const selector = document.getElementById('examSelector');
            for (let i = 0; i < selector.options.length; i++) {
                if (selector.options[i].value && selector.options[i].value !== 'data/zy.json') {
                    selector.options[i].disabled = false;
                    selector.options[i].text = selector.options[i].text.replace(' (需解锁)', '');
                }
            }
        }

        function lockOtherExams() {
            const selector = document.getElementById('examSelector');
            for (let i = 0; i < selector.options.length; i++) {
                if (selector.options[i].value && selector.options[i].value !== 'data/zy.json') {
                    selector.options[i].disabled = true;
                    if (!selector.options[i].text.includes('(需解锁)')) {
                        selector.options[i].text += ' (需解锁)';
                    }
                }
            }
        }

        // --- 启用/禁用顺序模式 ---
        function enableOrderMode() {
            document.getElementById('orderMode').classList.remove('locked');
            document.getElementById('orderMode').disabled = false;
        }

        function disableOrderMode() {
            document.getElementById('orderMode').classList.add('locked');
            document.getElementById('orderMode').disabled = true;
        }

        // --- 设置模式（带解锁检查） ---
        function setMode(mode) {
            if (mode === 'order' && !isZhaoYuUnlocked) {
                alert('🔒 顺序模式尚未解锁！请先在随机模式下完成赵宇真爱粉测试并获得满分。');
                return;
            }
            isRandomMode = (mode === 'random');
            document.getElementById('randomMode').classList.toggle('active', isRandomMode);
            document.getElementById('orderMode').classList.toggle('active', !isRandomMode);
        }

        // --- 从 localStorage 加载错误计数 ---
        function loadErrorCountsFromStorage(examFile) {
            const key = ERROR_STORAGE_PREFIX + examFile;
            const stored = localStorage.getItem(key);
            if (stored) {
                try { errorCounts = JSON.parse(stored); } catch (e) { errorCounts = {}; }
            } else {
                errorCounts = {};
            }
        }

        function saveErrorCountsToStorage() {
            if (!currentExamFile) return;
            const key = ERROR_STORAGE_PREFIX + currentExamFile;
            localStorage.setItem(key, JSON.stringify(errorCounts));
        }

        // --- 加载选定题库 ---
        async function loadSelectedExam() {
            const selector = document.getElementById('examSelector');
            const filePath = selector.value;
            if (!filePath) {
                alert('请先选择一套题库！');
                return;
            }

            // 如果是赵宇测试，重置满分标志
            if (filePath === 'data/zy.json') {
                zhaoYuPerfectScoreAchieved = false;
            }

            currentExamFile = filePath;
            loadErrorCountsFromStorage(currentExamFile);

            document.getElementById('loading').style.display = 'block';
            document.getElementById('examContainer').style.display = 'none';

            try {
                const response = await fetch(filePath);
                if (!response.ok) throw new Error('文件加载失败');
                currentExamData = await response.json();
                document.querySelector('h1').textContent = `📚 ${currentExamData.examTitle || '在线测试系统'}`;
                renderAllQuestions();
                document.getElementById('loading').style.display = 'none';
                document.getElementById('examContainer').style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) {
                alert('加载题库失败！目前题库正在制作中\n错误：' + error.message);
                document.getElementById('loading').style.display = 'none';
            }
        }

        // --- 渲染所有题目 ---
        function renderAllQuestions() {
            if (!currentExamData) return;
            renderChoiceQuestions();
            renderJudgeQuestions();
            renderFillQuestions();
            renderEssayQuestions();
        }

        function shuffleIfRandom(array) {
            if (isRandomMode) {
                return [...array].sort(() => Math.random() - 0.5);
            }
            return [...array];
        }

        // --- 错误计数相关（保持不变） ---
        function updateErrorDisplay(errorId) {
            const displayEl = document.querySelector(`[data-error-id="${errorId}"]`);
            if (displayEl) {
                const count = errorCounts[errorId] || 0;
                if (count > 0) {
                    displayEl.textContent = `❌ 错误 ${count} 次`;
                    displayEl.style.display = 'inline-block';
                } else {
                    displayEl.style.display = 'none';
                }
            }
        }

        function incrementError(errorId) {
            if (!errorCounts[errorId]) {
                errorCounts[errorId] = 0;
            }
            errorCounts[errorId]++;
            updateErrorDisplay(errorId);
            saveErrorCountsToStorage();
        }

        function resetAllErrors() {
            for (let key in errorCounts) {
                errorCounts[key] = 0;
                updateErrorDisplay(key);
            }
            saveErrorCountsToStorage();
        }

        function resetSectionErrors(type) {
            const prefix = type === 'choice' ? 'choice-' : 'judge-';
            for (let key in errorCounts) {
                if (key.startsWith(prefix)) {
                    errorCounts[key] = 0;
                    updateErrorDisplay(key);
                }
            }
            saveErrorCountsToStorage();
        }

        // --- 核心：渲染选择题（含多选题新逻辑）---
        function renderChoiceQuestions() {
            const container = document.getElementById('choice-questions');
            container.innerHTML = '';
            if (!currentExamData.choiceQuestions) return;

            let questions = currentExamData.choiceQuestions;
            questions = shuffleIfRandom(questions);

            questions.forEach((q, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'question';
                questionDiv.dataset.questionId = q.id;

                // Header
                const header = document.createElement('div');
                header.className = 'question-header';
                const questionText = document.createElement('div');
                questionText.className = 'question-text';
                const isMultiple = Array.isArray(q.answer);
                const questionType = isMultiple ? '【多选】' : '【单选】';
                questionText.textContent = `${index + 1}. ${questionType} ${q.question}`;
                header.appendChild(questionText);

                const errorId = `choice-${q.id}`;
                const errorCount = errorCounts[errorId] || 0;
                const errorDisplay = document.createElement('span');
                errorDisplay.className = 'error-count-display';
                errorDisplay.dataset.errorId = errorId;
                if (errorCount > 0) {
                    errorDisplay.textContent = `❌ 错误 ${errorCount} 次`;
                } else {
                    errorDisplay.style.display = 'none';
                }
                header.appendChild(errorDisplay);
                questionDiv.appendChild(header);

                // Options
                const optionsDiv = document.createElement('div');
                optionsDiv.className = 'options';
                const options = shuffleIfRandom(q.options);
                const originalIndexMap = new Map();
                options.forEach((option, shuffledIdx) => {
                    const originalIdx = q.options.indexOf(option);
                    originalIndexMap.set(shuffledIdx, originalIdx);
                });

                options.forEach((option, optIndex) => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    optionDiv.dataset.index = optIndex;

                    const label = document.createElement('label');
                    label.textContent = ` ${String.fromCharCode(65 + optIndex)}. ${option}`;
                    
                    const feedback = document.createElement('span');
                    feedback.className = 'feedback';

                    optionDiv.appendChild(label);
                    optionDiv.appendChild(feedback);

                    // 单选：点击即判断；多选：点击仅切换选中状态
                    if (isMultiple) {
                        // 多选题：点击切换选中状态
                        optionDiv.addEventListener('click', function(e) {
                            if (questionDiv.classList.contains('answered')) return;
                            this.classList.toggle('selected');
                        });
                    } else {
                        // 单选题：点击即判断（保留原有逻辑）
                        optionDiv.addEventListener('click', function(e) {
                            if (questionDiv.classList.contains('answered')) return;
                            questionDiv.classList.add('answered');
                            optionsDiv.querySelectorAll('.option').forEach(opt => {
                                opt.classList.add('answered');
                            });

                            const selectedShuffledIndex = parseInt(this.dataset.index);
                            const selectedOriginalIndex = originalIndexMap.get(selectedShuffledIndex);
                            const isCorrect = selectedOriginalIndex === q.answer;

                            optionsDiv.querySelectorAll('.option').forEach(opt => {
                                opt.classList.remove('selected', 'wrong');
                                opt.querySelector('.feedback').textContent = '';
                            });

                            if (isCorrect) {
                                this.classList.add('selected');
                                this.querySelector('.feedback').textContent = '✓ 正确';
                                this.querySelector('.feedback').className = 'feedback correct-feedback';
                                // 检查是否满分
                                checkZhaoYuPerfectScore();
                            } else {
                                incrementError(errorId);
                                this.classList.add('wrong');
                                this.querySelector('.feedback').textContent = '✗ 错误';
                                this.querySelector('.feedback').className = 'feedback wrong-feedback';

                                // 显示正确答案
                                optionsDiv.querySelectorAll('.option').forEach(opt => {
                                    const shuffledIdx = parseInt(opt.dataset.index);
                                    const originalIdx = originalIndexMap.get(shuffledIdx);
                                    if (originalIdx === q.answer) {
                                        opt.classList.add('selected');
                                        opt.querySelector('.feedback').textContent = '✓ 正确答案';
                                        opt.querySelector('.feedback').className = 'feedback correct-feedback';
                                    }
                                });
                                // 赵宇测试答错处理
                                handleZhaoYuWrongAnswer();
                            }
                        });
                    }

                    optionsDiv.appendChild(optionDiv);
                });

                // 如果是多选题，添加“确认”按钮
                if (isMultiple) {
                    const confirmBtn = document.createElement('button');
                    confirmBtn.className = 'confirm-btn';
                    confirmBtn.textContent = '确认选择';
                    confirmBtn.addEventListener('click', function() {
                        if (questionDiv.classList.contains('answered')) return;
                        
                        const selectedOptions = optionsDiv.querySelectorAll('.option.selected');
                        if (selectedOptions.length === 0) {
                            alert('请至少选择一个选项！');
                            return;
                        }

                        questionDiv.classList.add('answered');
                        optionsDiv.querySelectorAll('.option').forEach(opt => {
                            opt.classList.add('answered');
                        });

                        // 获取选中的原始索引
                        const selectedIndices = Array.from(selectedOptions).map(opt => {
                            const shuffledIdx = parseInt(opt.dataset.index);
                            return originalIndexMap.get(shuffledIdx);
                        }).sort();

                        const correctAnswers = [...q.answer].sort();
                        const isCorrect = JSON.stringify(selectedIndices) === JSON.stringify(correctAnswers);

                        // 清除之前的反馈
                        optionsDiv.querySelectorAll('.option').forEach(opt => {
                            opt.classList.remove('selected', 'wrong');
                            opt.querySelector('.feedback').textContent = '';
                        });

                        if (isCorrect) {
                            selectedOptions.forEach(opt => {
                                opt.classList.add('selected');
                            });
                            // 在所有选中的选项上显示正确
                            selectedOptions.forEach(opt => {
                                opt.querySelector('.feedback').textContent = '✓ 正确';
                                opt.querySelector('.feedback').className = 'feedback correct-feedback';
                            });
                            // 检查是否满分
                            checkZhaoYuPerfectScore();
                        } else {
                            incrementError(errorId);
                            // 标记用户选择的为错误
                            selectedOptions.forEach(opt => {
                                opt.classList.add('wrong');
                                opt.querySelector('.feedback').textContent = '✗ 错误';
                                opt.querySelector('.feedback').className = 'feedback wrong-feedback';
                            });
                            // 显示正确答案
                            optionsDiv.querySelectorAll('.option').forEach(opt => {
                                const shuffledIdx = parseInt(opt.dataset.index);
                                const originalIdx = originalIndexMap.get(shuffledIdx);
                                if (correctAnswers.includes(originalIdx)) {
                                    opt.classList.add('selected');
                                    opt.querySelector('.feedback').textContent = '✓ 正确答案';
                                    opt.querySelector('.feedback').className = 'feedback correct-feedback';
                                }
                            });
                            // 赵宇测试答错处理
                            handleZhaoYuWrongAnswer();
                        }
                    });
                    questionDiv.appendChild(confirmBtn);
                }

                questionDiv.appendChild(optionsDiv);
                container.appendChild(questionDiv);
            });
        }

        // --- 赵宇测试答错处理 ---
        function handleZhaoYuWrongAnswer() {
            // 仅当是赵宇测试且尚未解锁时生效
            if (currentExamFile === 'data/zy.json' && !isZhaoYuUnlocked) {
                // 检查是否有任何题目答错了（即存在带有 'wrong' 类的选项）
                const anyWrong = document.querySelectorAll('.option.wrong').length > 0;
                if (anyWrong) {
                    alert('❌ 答错了！赵宇测试需要满分才能解锁其他题库。即将重新开始...');
                    // 重置本次测试的所有状态
                    resetCurrentExamState();
                    // 重新加载赵宇测试
                    loadSelectedExam();
                }
            }
        }

        // --- 重置当前考试状态（清空答案、恢复选项）---
        function resetCurrentExamState() {
            // 移除所有题目的 answered 状态
            document.querySelectorAll('.question.answered').forEach(el => el.classList.remove('answered'));
            // 移除所有选项的 selected, wrong, answered 状态
            document.querySelectorAll('.option.selected, .option.wrong, .option.answered').forEach(el => {
                el.classList.remove('selected', 'wrong', 'answered');
                const feedback = el.querySelector('.feedback');
                if (feedback) feedback.textContent = '';
            });
            // 启用所有禁用的输入框（如果有的话）
            document.querySelectorAll('input:disabled').forEach(el => el.disabled = false);
        }

        // --- 检查赵宇测试是否满分 ---
        function checkZhaoYuPerfectScore() {
            if (currentExamFile !== 'data/zy.json' || isZhaoYuUnlocked) return;
            
            // 检查选择题和判断题是否全部已回答
            const choiceAndJudgeQuestions = document.querySelectorAll('#choice-questions .question, #judge-questions .question');
            const allCJAnswered = choiceAndJudgeQuestions.length > 0 && Array.from(choiceAndJudgeQuestions).every(q => q.classList.contains('answered'));
            
            // 检查是否有任何错误
            const anyWrong = document.querySelectorAll('.option.wrong').length > 0;
            
            if (allCJAnswered && !anyWrong) {
                // 满分达成！
                isZhaoYuUnlocked = true;
                localStorage.setItem(UNLOCK_STORAGE_KEY, 'true');
                unlockOtherExams();
                enableOrderMode();
                alert('🎉 恭喜！您已满分完成赵宇真爱粉测试！\n所有其他题库和顺序模式现已解锁！');
            }
        }

        // --- 渲染判断题（保持不变，但加入赵宇满分检查）---
        function renderJudgeQuestions() {
            const container = document.getElementById('judge-questions');
            container.innerHTML = '';
            if (!currentExamData.judgeQuestions) return;

            let questions = currentExamData.judgeQuestions;
            const judgeOptions = ["√ 正确", "× 错误"];
            questions = shuffleIfRandom(questions);

            questions.forEach((q, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'question';
                questionDiv.dataset.questionId = q.id;

                const header = document.createElement('div');
                header.className = 'question-header';
                const questionText = document.createElement('div');
                questionText.className = 'question-text';
                questionText.textContent = `${index + 1}. ${q.question}`;
                header.appendChild(questionText);

                const errorId = `judge-${q.id}`;
                const errorCount = errorCounts[errorId] || 0;
                const errorDisplay = document.createElement('span');
                errorDisplay.className = 'error-count-display';
                errorDisplay.dataset.errorId = errorId;
                if (errorCount > 0) {
                    errorDisplay.textContent = `❌ 错误 ${errorCount} 次`;
                } else {
                    errorDisplay.style.display = 'none';
                }
                header.appendChild(errorDisplay);
                questionDiv.appendChild(header);

                const optionsDiv = document.createElement('div');
                optionsDiv.className = 'options';
                const options = shuffleIfRandom(judgeOptions);

                options.forEach((option, optIndex) => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    const isThisOptionTrue = option.startsWith('√');
                    optionDiv.dataset.correct = (isThisOptionTrue === q.answer);

                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = `judge-${q.id}`;
                    radio.id = `judge-${q.id}-opt${optIndex}`;
                    const label = document.createElement('label');
                    label.htmlFor = `judge-${q.id}-opt${optIndex}`;
                    label.textContent = ` ${option}`;
                    const feedback = document.createElement('span');
                    feedback.className = 'feedback';
                    optionDiv.appendChild(radio);
                    optionDiv.appendChild(label);
                    optionDiv.appendChild(feedback);

                    optionDiv.addEventListener('click', function() {
                        if (questionDiv.classList.contains('answered')) return;
                        questionDiv.classList.add('answered');
                        optionsDiv.querySelectorAll('.option').forEach(opt => {
                            opt.classList.add('answered');
                            opt.querySelector('input').disabled = true;
                        });

                        const isCorrect = this.dataset.correct === 'true';
                        const allOptions = this.parentElement.querySelectorAll('.option');
                        allOptions.forEach(opt => {
                            opt.classList.remove('selected', 'wrong');
                            opt.querySelector('.feedback').textContent = '';
                        });

                        if (isCorrect) {
                            this.classList.add('selected');
                            this.querySelector('.feedback').textContent = '✓ 正确';
                            this.querySelector('.feedback').className = 'feedback correct-feedback';
                            // 检查是否满分
                            checkZhaoYuPerfectScore();
                        } else {
                            incrementError(errorId);
                            this.classList.add('wrong');
                            this.querySelector('.feedback').textContent = '✗ 错误';
                            this.querySelector('.feedback').className = 'feedback wrong-feedback';
                            allOptions.forEach(opt => {
                                const optIsTrue = opt.querySelector('label').textContent.includes('√');
                                if (optIsTrue === q.answer) {
                                    opt.classList.add('selected');
                                    opt.querySelector('.feedback').textContent = '✓ 正确答案';
                                    opt.querySelector('.feedback').className = 'feedback correct-feedback';
                                }
                            });
                            // 赵宇测试答错处理
                            handleZhaoYuWrongAnswer();
                        }
                    });

                    optionsDiv.appendChild(optionDiv);
                });

                questionDiv.appendChild(optionsDiv);
                container.appendChild(questionDiv);
            });
        }

        // --- 渲染填空题和简答题（保持不变）---
        function renderFillQuestions() {
            const container = document.getElementById('fill-questions');
            container.innerHTML = '';
            if (!currentExamData.fillQuestions) return;

            const questions = shuffleIfRandom(currentExamData.fillQuestions);

            questions.forEach((q, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'question';
                const questionText = document.createElement('div');
                questionText.className = 'question-text';
                questionText.innerHTML = `${index + 1}. ${q.question}`;
                questionDiv.appendChild(questionText);

                const btn = document.createElement('button');
                btn.className = 'toggle-answer-btn';
                btn.textContent = '显示答案';
                const answerDiv = document.createElement('div');
                answerDiv.className = 'answer-area';
                const answer = Array.isArray(q.answer) ? q.answer.join('、') : q.answer;
                answerDiv.innerHTML = `<strong>参考答案：</strong>${answer}`;

                btn.onclick = function() {
                    if (answerDiv.style.display === 'block') {
                        answerDiv.style.display = 'none';
                        btn.textContent = '显示答案';
                    } else {
                        answerDiv.style.display = 'block';
                        btn.textContent = '隐藏答案';
                    }
                };

                questionDiv.appendChild(btn);
                questionDiv.appendChild(answerDiv);
                container.appendChild(questionDiv);
            });
        }

        function renderEssayQuestions() {
            const container = document.getElementById('essay-questions');
            container.innerHTML = '';
            if (!currentExamData.essayQuestions) return;

            const questions = shuffleIfRandom(currentExamData.essayQuestions);

            questions.forEach((q, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'question';
                const questionText = document.createElement('div');
                questionText.className = 'question-text';
                questionText.textContent = `${index + 1}. ${q.question}`;
                questionDiv.appendChild(questionText);

                const btn = document.createElement('button');
                btn.className = 'toggle-answer-btn';
                btn.textContent = '显示参考答案';
                const answerDiv = document.createElement('div');
                answerDiv.className = 'answer-area';
                answerDiv.innerHTML = `<strong>参考答案：</strong>\n${q.answer}`;

                btn.onclick = function() {
                    if (answerDiv.style.display === 'block') {
                        answerDiv.style.display = 'none';
                        btn.textContent = '显示参考答案';
                    } else {
                        answerDiv.style.display = 'block';
                        btn.textContent = '隐藏参考答案';
                    }
                };

                questionDiv.appendChild(btn);
                questionDiv.appendChild(answerDiv);
                container.appendChild(questionDiv);
            });
        }

        document.addEventListener('DOMContentLoaded', function() {
    checkAndApplyUnlockStatus();
    // 延迟一点显示通知，让页面先渲染
    setTimeout(() => {
        if (isZhaoYuUnlocked) {
            showNotification('unlock');
        } else {
            showNotification('locked');
        }
    }, 2000); // 等2秒再显示，避免干扰初始操作
});

        
 !function(){
 function antiDebug(){
   debugger;
   setTimeout(antiDebug,500)
 }
 antiDebug()
 }();
 
 let w=innerWidth,h=innerHeight;
 window.addEventListener('resize',()=>{
   if(innerWidth<w||innerHeight<h)location.reload()
 })
  