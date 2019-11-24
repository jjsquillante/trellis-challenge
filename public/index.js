const btn = document.getElementById('openTrellisButton');
const handler = TrellisConnect.configure({
  client_id: 'CHALLENGE',
  features: 'nostickystate',
  onSuccess: async (accountId, metadata) => {
    // 1. set loading icon.
    toggleLoading();
    // 2. close modal -- not the best way..but..for simplicity in demo purposes.
    document.getElementsByTagName('iframe')[0].parentElement.style['display'] = 'none';
    // 3. fetch policy data
    const response = await fetch(`http://localhost:3000/account/${accountId}/policies`);
    const data = await response.json();
    // 4. build display, toggleLoading, display html
    const policyContainer = document.querySelector('#displayPolicy');
    policyContainer.innerHTML += buildDisplay(data);
    toggleLoading();
    policyContainer.classList.toggle('is-hidden');
  },
  // todo - build out onFailure, onClose handlers
  onFailure: () => {
    console.log('error validating login...');
  },
  onClose: () => {
    console.log('closing...');
  },
});
btn.addEventListener('click', (e) => {
  e.preventDefault();
  handler.open();
});

/** Toggle Loading Icon. */
function toggleLoading() {
  document.querySelector('div.spinner').classList.toggle('is-hidden');
}

/**
  * Build and html string to display policy information.
  * @example
  * // returns `<ul><li>1</li><li>2</li></ul>`
  * buildDisplay([1,2]);
  * @param {Object} data - Policy information returned from server.
  * @return {String} Returns an html string based on the data passed in the argument.
 */
function buildDisplay(data) {
  let html = ``;
  // check for errors.
  if (data.error) {
    html += `<p>There was an error retrieving policy information.</p>`;
  }
  // check if we have any policy data available
  if (data.policies && data.policies.length) {
    const policy = data.policies[0];
    policy.vehicles.forEach((vehicle) => {
      html +=
          `<div class="box">
            <article class="media">
              <div class="media-content">
                <p class="is-size-5 is-family-monospace is-uppercase">
                  Make: ${vehicle.make}
                </p>
                <p class="is-size-5 is-family-monospace is-uppercase">
                  Model: ${vehicle.model}
                </p>
                <p class="is-size-5 is-family-monospace is-uppercase">
                  Year: ${vehicle.year}
                </p>
                <p class="is-size-5 is-family-monospace is-uppercase">
                  VIN: ${vehicle.vin}
                </p>
              </div>
            </article>
          </div>`;
    });
  } else {
    html += `<p>No vehicle information to display...</p>`;
  }
  return html;
}
