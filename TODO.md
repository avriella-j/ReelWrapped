# TODO: Change "Celebrity" to "Creator" throughout the application

## Files to Update:
- [ ] app/templates/foryou.html: Change "Celebrities to Follow" to "Creators to Follow"
- [ ] app/templates/profile.html: Change "Followed Celebrities" to "Followed Creators"
- [ ] app/templates/user_detail.html: Change "Followed Celebrities" to "Followed Creators"
- [ ] app/templates/mutuals.html: Change "Celebrity Fans" to "Creator Fans"
- [ ] app/blueprints/main.py: Change variable names from "celebrities" to "creators", and trend_type from 'celebrity' to 'creator'
- [ ] app/utils/db.py: Change trend_type from 'celebrity' to 'creator' in sample data
- [ ] app/utils/helpers.py: Change trend_type from 'celebrity' to 'creator'
- [ ] app/blueprints/mutuals.py: Change variable names and references
- [ ] app/static/js/main.js: Change filter option from "celebrity" to "creator"

## Testing:
- [ ] Verify that the "For You" page displays "Creators to Follow" section
- [ ] Verify that profile pages show "Followed Creators" instead of "Followed Celebrities"
- [ ] Verify that filtering by "creator" works in the mutuals page
- [ ] Verify that database queries still work with the new trend_type
