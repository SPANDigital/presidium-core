---
---

window.presidium.config = {
  name: "{{ site.name }}",
  baseurl:  "{{ site.baseurl }}",
  brandurl:  "{{ site.brandurl }}",
  repourl:  "{{ site.repourl }}"
}
window.presidium['versions'] = { siteroot: "{{ site.siteroot }}" };
window.presidium.menu.load({% include menu.json %}, 'presidium-navigation');
window.presidium.tooltips.load({ "baseurl": "{{ site.baseurl }}" });
