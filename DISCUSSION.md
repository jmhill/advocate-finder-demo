# Solace recruitment activity 

## Assignment

### Tasks (copied from assignment)

1. Fix any glaring bugs and anti patterns.
2. Improve the design UI/UX to make the experience better for prospective patients. We value design heavily at Solace so feel free to flex your skills in this area. The repo is set up with tailwind but feel free to use any styling framework you’d like.
3. Consider both frontend and backend performance improvements. Assume we have a database of hundreds of thousands of advocates we need to search through.

### Deliverables (copied from assignment)

1. Submit the assignment with a link to the cloned repo with the PRs of your changes
2. Add whatever extra notes you want to `DISCUSSION.md` explaining any other improvements you’d want to make if you had more time. Note that we aren't evaluating you on your familiarity with Markdown but feel free to add formatting if you wish.

## development methodology for this assignment

I chose to address this project as if I was being asked to work through making a prototype into a production-ready app. Therefore, my approach revolved around eliminating immediately apparent bugs so that we could get the app back to a reasonably stable base, while investigating which key pieces were missing to support working on the app in team/professional environment.

My initial approach:
1. Installation/dev base case (no external dependencies)
2. Review basic layout of application
3. Set up local database
4. Code review with TODOs
5. Decide on development methodology for this assignment, compare to normal development methodology
6. Develop initial list of tasks
7. Iterate through task list and adjust as needed, keeping devlog of each step.
8. Copy devlog into DISCUSSION.md and flesh out approach for unaddressed features

Ultimately, my approach ran up against some issues that would have been more time-consuming to address, given my unfamiliarity with drizzle.

If this were a "real" app, before I proceeded any further I would want to ensure that I had:
1. Solid support for migrations (not just push/sync)
2. The ability to seed larger amounts of randomly-generated data in an easily reproducible way
3. Basic unit-testing around key functions (such as data filtering), and ideally some sort of e2e testing for at least 'happy path' scenarios.

Where my expectations ran up against the limitations of the demo repo, I tried to note as much in devlog below.

## Task Queue:

- [x] set up local database
- [x] fix error toast (hydration error with table elements)
- [x] fix search/filter error
- [x] page.tsx: direct mutation of search term innerhtml
- [x] set up test command
- [x] ui: styles: the table is rather difficult to read due to lack of styling, could at least separate rows
- [ ] db: normalize specialties: the specialties for each advocate are currently saved as a JSON field; this seems an odd approach since I don't think we can really index on that field and there's no way to enforce consistency in how the specialties are saved? So this should probably be its own table with a many-to-many join between specialties and advocates
- [ ] page.tsx: advocate is of type 'never' (type inference not working?)
- [ ] api and ui: pagination: rather than fetch all records, we should assume we need to support hundreds of thousands of records, and should therefore implement a paged response for our api and the ability to switch page in our UI
- [ ] api: search: if we implement a paged response, we'll also need to implement a search endpoint that will allow us to return a subset of records based on search criteria. This will of course interact with any changes we make to support e.g. pagination, because we'll need to be able to page through a search result as well
- [ ] api: security: remove seed route
- [ ] api: remove direct references to ORM types from application code
- [ ] ui: filter table by minimum years of experience
- [ ] ui: filter function is not very forgiving (is case sensitive, whitespace sensitive so it'll filter stuff out when you do common things like type first and last name or other combinations of multiple fields). May or may not be worth the time to implement this on the UI side if we end up just implementing a search endpoint on the backend instead.

## Devlog

### Task 1: Install and check dev environment

I've been using devbox at work, which is a nice little CLI wrapper around Nix that helps with creating shareable, easy-to-replicate development environments. So first step was installing a recent version of nodejs and typescript-language-server for use with my editor.

Completed npm install of dependencies and ran `npm run dev` to test out the base case. Everything seems to work ok in terms of initial build and dev server.

### Task 2: Review basic layout of application

At first glance, application layout is fairly straightforward. I'm not super familiar with nextjs, but understand the concept of "api routes" in the nextjs context, and so we'll follow the instruction from the assignment spec and treat our client and server as different applications, with all 'backend' code going in the _api_ dir. For our initial set of tasks we shouldn't need much more organization of the frontend; can probably work on a single page.

First issue of note: **there's no test script at all?** As indicated in the assignment spec, part of the intent in our initial set of tasks should be to remove bugs or refactor code that is not following reasonable patterns. Doing so without testing in place is unreliable at best.

Added a task to the queue to set up initial test runner.

### Task 3: Set up local database

The project contains a docker compose config for adding a local postgres db for testing; definitely want that up and running to verify that we can seed the data. Ideally we can even update the seeder to put in a slightly more realistic amount of data, which will help with engaging with the product to determine improvements in scenarios where we're trying to search though a large number of advocates.

Followed the instructions in the readme which were mostly correct - I've used mySQL and MSSQL server on previous jobs, but not postgres, so some of the mental models are slightly different (for instance, noticed that a connection string in postgres is always associated with a particular database).

Did not have to actually create the database myself, running drizzle-kit push command and the seeder was enough to get up and running.

Noticed there's already an error toast about a 'hydration failed', will add that to the task queue if can't be fixed quickly.

### Task 4: Hydration Error due to table layout

This was easy to fix but I didn't have time to dive too deep into why the error was presenting as a hydration error. Problem is essentially that html thead elements should have a tr as a child, so my guess is that it was one of the those situations where the browser was 'helping' by automatically adding in the correct elements, which then didn't match the next.js render function result, which led to next.js getting angry. In any case, works now, so moving on.

Immediately noticed that typing a character into the search box pops another error toast, this time about an error in the filter function that runs on search. Will add to the queue and fix if I choose to keep this implementation (if we immediately jump to something like adding pagination, we'll have to implement a new search function anyways, so this problem might go away as part of that - but it would be nice to get the app running as-is without errors too.)

### Task 5: quick code review with todos/create a task backlog

I'm gonna do a quick sweep of the code to see where things like typescript/linting errors are occurring, and create a backlog of fixes and features to consider working on. I only want to spend another hour or two on this, so will need to prioritize.

Noticed that there's a helpful lint command already available in package.json, so I'll run that to see our baseline: result is good, we only have a few errors related to "missing 'key' prop for element in iterator", a common oversight in react code that iterates over a list to generate dom elements (lists, tables rows are common culprits - react needs that key so it can properly keep track of which elements are being dynamically added or removed from the dom).

I will fix that immediately, no need to add to queue.

Now that the linter is reporting clean, can just eyeball the typescript errors quickly since this is a small project.

page.tsx
- page.tsx: advocate is of type 'never' (type inference not working?)
- page.tsx: direct mutation of search term innerhtml
- ~~page.tsx: reset button doesn't do anything, handler has name that is not very descriptive~~
	- scratched this one out because it was solved by fixing other initial bug with search filtering

Another issue I notice: having an exposed API route that can arbitrarily insert records into our database (the seed route) is not good (for obvious security reasons), it looks like there's already some package.json scripts for managing migrations and seeding, so I should probably just make sure those scripts work and update the readme.

- api: remove seed route

On top of these fixes, there are some features that come to mind:
- api and ui: pagination: rather than fetch all records, we should assume we need to support hundreds of thousands of records, and should therefore implement a paged response for our api and the ability to switch page in our UI
- api: search: if we implement a paged response, we'll also need to implement a search endpoint that will allow us to return a subset of records based on search criteria
- db: normalize specialties: the specialties for each advocate are currently saved as a JSON field; this seems an odd approach since I don't think we can really index on that field and there's no way to enforce consistency in how the specialties are saved? So this should probably be its own table with a many-to-many join between specialties and advocates
- ui: styles: the table is rather difficult to read due to lack of styling, could at least separate rows

That all sounds like a good enough start to at least put some tasks in the queue and prioritize, so will hoist these to the task list at the top of the doc and figure out what to work on next.

### Task 6: api: remove seed route

This one I popped up to the top of the list just because this seemed like an odd approach that bordered on a security risk (or at least a vector for abuse). Since there is no authentication or authorization, if this endpoint is exposed in our production server, anybody can just hit the endpoint and spam us with the creation of many test advocates.

Generally speaking we want to seed our development database via a script - ideally we could set it up so that running `npm run dev` would run all migrations and seeders first, so that we always start with a fresh development environment (and to encourage us to update our migrations and seeders correctly as our feature set grows.)

To start, I'll review the built-in npm scripts and make sure they work as intended.

I can refresh my dev database easily by running `docker compose down -v` to kill off the database storage volume.

I spent a little time looking into this; getting the drizzle generate and migrate:up commands was easy enough, so feel a little better that we have that approach working now, but the seed was a little more annoying to fiddle with: main reason is that the migrate script can be run as a one-off with node, whereas the seed command in package.json is relying on some esbuild-register tooling that I'm not sure how to use correctly, and pointing to a file that doesn't currently exist in the repo for that matter.

So, for the sake of doing this as an exercise, I committed a tiny change to make the migrate:up command work at least, and am abandoning the seeder for the moment.

**IMPORTANT NOTE**: In a 'real' application, I would not proceed past this point until we had a good story for database migration and test data management/seeding in place. Migrations and test data management are vitally important for working on applications in a team setting.

### Task 7: error on search entry

Whenever the search input changes, we're throwing this error:

```
advocate.yearsOfExperience.includes is not a function
```

...because yearsOfExperience is a number.

We'll spend the next couple of tasks getting the basic app as-written as bug free as possible to give us a stable base for iteration.

Years of experience actually seems like an odd thing to match on as a search term, since my guess is that people are more likely to want to find somebody with a minimum number of years of experience, and not an exact number of years.

To keep moving, however, we'll just convert the number to a string and add a feature idea to our queue for filtering table by minimum number of years of experience.

### Task 8: direct mutation of dom within change event handler and reset state handling

The handling of the changes to search term was a little wonky - since we want to both use the search term to filter the currently displayed view on-demand, and display the search term on the screen, it might make sense to turn the input into a controlled element, so react can manage the state of the input and we can rely on that state being within the react data flow.

This has the benefit of making it a tiny bit easier to ensure the UI is in sync after we hit the 'reset' button, since we can reset our search term state directly and be confident it will update elsewhere in the UI.

Conversely, we can simplify our state management by removing the separate array of filtered advocates, and just filtering the list of fetched advocates on render as changes to the search term occur.

### Task 9: Set up test command

Now that we've got the initial, easily observed errors resolved, we need to be able to write tests so that we can make changes to the application with confidence.

As mentioned I don't know a lot about next.js and what their preferences are, but vitest looks easy enough to set up quickly so will try that first: https://nextjs.org/docs/app/building-your-application/testing/vitest

Implemented a quick sanity test to make sure the framework could run as expected.

Writing tests against the entire page using e.g. react testing library would be a little more involved since we'd have to mock out the API calls or otherwise change up our component architecture to not have to hit the real API.

But, this is good enough to start so that we can, for example, write simple unit tests against functions that are doing important stuff like filtering data or whatever.

### Task 10: basic styling for legibility

Been a while since I looked at tailwind but I know the basic concept of utility classes, so let's see if we can make the table a little more legible at least to start.

Opted to just copy over some of the examples from tailwind to at least make it so we could clearly pick out the input, the reset button, and the individual cells in the table.

Not a final design by any means but enough to at least see what we're looking at data-wise.

### Task 11: normalize database schema

Ran out of time, so this would have been next up for me in terms of importance/priority, but unfortunately is a bit involved:

- Change our drizzle schema and either push/sync, or start putting together real migrations
	- specialties table
	- set relation between advocates and specialties
- Would have to finally address the seeder/test data management in more detail, since we'd no longer be tossing an arbitrary array in to a json column
	- One approach could be to still keep using the advocate data as written, but just replace the part where we randomly assign from the array of specialties to instead randomly assign specialty ids (from the specialty table)
	- This being my first exposure to drizzle, would have to spend a little time making sure this makes sense
	- Alternatively, drizzle-kit appears to have a supporting library called "drizzle seed" that helps create deterministic, random-appearing test data. That could be a good tool to adopt at this juncture.




