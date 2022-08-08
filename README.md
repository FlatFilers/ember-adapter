# The Flatfile Component - @flatfile/ember

> NOTE: this component can only be used with Flatfile Portal 2.0. If you are trying to set up Flatfile 3.0, please visit the 3.0 docs [here](https://flatfile.com/docs/getting-started/).

We've made it really simple for you to get started with Flatfile with our new Flatfile Component. Here's what you'll need to know to get started.

First, install the dependency via npm:

`ember install @flatfile/ember`

This will give you access to the `<FlatfileButton />` component as well as the same basic functionality as our Adapter.

## FlatfileButton usage

```hbs
<FlatfileButton
  @licenseKey="License Key Here"
  @customer={{hash userId="12345"}}
  @settings={{hash
    type="Contract"
    fields=(array
      (hash label="Full Name" key="name")
      (hash label="Email" key="name")
    )
  }}>
  Import Contacts
</FlatfileButton>
```

| **<u>FlatfileButton Arguments</u>**                                                                                         | **<u>Info</u>**               | <u>**Example**</u>                     |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------- | -------------------------------------- |
|`licenseKey` - Your Flatfile license key can be found in your dashboard when you [login here](https://app.flatfile.io/login).|**Required**. <br /> _string_ | `licenseKey={'ah12-alksjs2738-shdkaj123'}` |
|`customer` - Refers to the _[setCustomer function](https://developers.flatfile.io/docs/sdk/classes/flatfileimporter#setcustomer)_. | **Required**. <br /> _object_ - [_CustomerObject_](https://developers.flatfile.io/docs/sdk/interfaces/customerobject) | `customer={{` <br />`usedId: "1234",`<br />`companyId: "12",`<br />` companyName: "ABC",`<br />`email: "john@doe.com",`<br />`name: "John Doe"`<br />`}}`|
|`settings` - This is where you will pass your [Flatfile settings/options](https://developers.flatfile.io/docs/options). | **Required**. <br />_object_ | `settings={{ `<br /> `type: "Customers", fields: [` <br /> `{key: "name", label: "Name"}, {key: "email", label: "Email"}`<br />`]}}` |
|`onCancel` - An optional callback for handling a user cancelling.|Optional. <br /> _function - callback_| `onCancel={() => { // do something }}`|
|`onInteractionEvent` - An optional way to use `registerInteractionEventCallback` to receive user interaction events. By default, the `onInteractionEvent` function will be called every 5 seconds, as long as there is user activity inside of Flatfile Portal.|Optional. <br />_function_| `onInteractionEvent={({mousemove, mousedown, keydown}) => // do something}`|
|`onBeforeFetch` - An optional callback called before fetching | Optional. <br />_function_ | `onBeforeFetch={() => { // do something}` |
|`onData`- An optional way to use [FlatfileResults](https://developers.flatfile.io/docs/sdk/classes/flatfileresults) to return a new Promise.|Optional. <br />_function_| `onData={async results => // do something}`|
|`onRecordChange`- An optional way to use [registerRecordHook](https://developers.flatfile.io/docs/datahooks#record-hooks-row-hooks) when a record changes.| Optional. <br /> _function_ |`onRecordChange={(data, index) => `[`IDataHookResponse`](https://developers.flatfile.io/docs/sdk/interfaces/idatahookresponse) &#124; `Promise<`[`IDataHookResponse`](https://developers.flatfile.io/docs/sdk/interfaces/idatahookresponse)`>}`|
|`onRecordInit`- An optional way to use [registerRecordHook](https://developers.flatfile.io/docs/datahooks#record-hooks-row-hooks) on initialization.|Optional. <br />_function_|_`onRecordInit={(data, index) => `[`IDataHookResponse`](https://developers.flatfile.io/docs/sdk/interfaces/idatahookresponse) &#124; `Promise<`[`IDataHookResponse`](https://developers.flatfile.io/docs/sdk/interfaces/idatahookresponse)`>}`_|
|`fieldHooks`- An optional way to pass in one or more callback functions to use with [registerFieldHook](https://developers.flatfile.io/docs/datahooks#field-hooks-column-hooks).|Optional. <br />object function(s) - callback(s)|`fieldHooks={`<br />`fieldName: (values) => { return // [`[`IDataHookRecord`](https://developers.flatfile.io/docs/sdk/interfaces/idatahookresponse/)`, index][]}`|
|`preload`- An optional flag that can be set to `false` to delay loading the importer until the button is clicked. Useful in situations where there is more than one `<FlatfileButton/>` instance on a single page or minimizing page load size is important. Default is `true`.|Optional. <br />boolean |`preload={false}`|

The component also yields out the component state to allow handling of loading states how you wish.

```hbs
  as | flatfileState |>
```

| **<u>FlatfileButton Yields</u>**                                                                                        | **<u>Info</u>**               | <u>**Example**</u>                     |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------- | -------------------------------------- |
|`isLoading` - start true if the preload argument is true, otherwise is false until loading starts | _boolean_ | `flatfileState.isLoading` |
|`isReady` - starts false, becomes true when Flatfile has been initialized and loaded | _boolean_ | `flatfileState.isReady` |

## FlatfileProvider usage

```hbs
<FlatfileProvider
  @licenseKey="License Key Here"
  @customer={{hash userId="12345"}}
  @settings={{hash
    type="Contract"
    fields=(array
      (hash label="Full Name" key="name")
      (hash label="Email" key="name")
    )
  }} as | flatfile |>
  <a href="#" {{on "click" flatfile.open}}>
    FlatfileProvider with html anchor link
  </a>
</FlatfileProvider>
```

All of the same component arguments are available for FlatfileProvider as are available above for FlatfileButton.

The component also yields out the component state to allow handling of loading states how you wish.

```hbs
  as | flatfile |>
```

| **<u>FlatfileProvider Yields</u>**                                                                                        | **<u>Info</u>**               | <u>**Example**</u>                     |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------- | -------------------------------------- |
|`flatfile.open` - can be tied to an event to open the flatfile importer, this is the default click event for FlatfileButton | _action_ or _function_ | `{{on "click" flatfile.open}}` |
|`flatfile.state.isLoading` - start true if the preload argument is true, otherwise is false until loading starts | _boolean_ | `flatfile.state.isLoading` |
|`flatfile.state.isReady` - starts false, becomes true when Flatfile has been initialized and loaded | _boolean_ | `flatfile.state.isReady` |
