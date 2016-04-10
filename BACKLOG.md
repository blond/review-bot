# MAJOR
  * логировать промежуточные итоги выбора ревьювира и сохранять в БД
  * добавить модель 'Пользователь' и хранить там настройки уведомлений
  * добавить команду '/replace "username"' для смены одного из ревьювиров на случайного
    * добавить тест в integration.sh

# BACKLOG
  * добавить email, как траспорт, для доставки уведомлений
  * отказаться от parseLogin и переиспользоать regexp'ы команд.
  * перенести часть настроек в БД.
    * от настроек может потребоватся запуск, ранее не запущенных, служб.
    * нужно иметь возможность добавить в конфиг новые службы на стадии старта приложения.
  * перенести шаблоны уведомлений в БД.

# REFACTOR

# CHECKLIST
  * modules/badge-base
  * modules/config
  * plugins/complexity
  * plugins/review-autoassign
  * plugins/review-badges
  * services/badge-constructor
  * services/choose-reviewer
