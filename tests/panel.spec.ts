import { expect, test } from '@grafana/plugin-e2e';

test('should display sample data', async ({ gotoPanelEditPage, readProvisionedDashboard }) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });
  await expect(panelEditPage.panel.locator).toContainText('Sample Data');
});

test('should display search when enabled', async ({ gotoPanelEditPage, readProvisionedDashboard, page }) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });
  const options = panelEditPage.getCustomOptions('Search');
  const showSearch = options.getSwitch('Show Search');
  await showSearch.check();
  await expect(page.getByTestId('search-input')).toBeVisible();
});

test('should hide search when disabled', async ({ gotoPanelEditPage, readProvisionedDashboard, page }) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });
  const options = panelEditPage.getCustomOptions('Search');
  const showSearch = options.getSwitch('Show Search');
  await showSearch.uncheck();
  await expect(page.getByTestId('search-input')).not.toBeVisible();
});
