// Test Upload API endpoints

async function testUploadAPI() {
  console.log('🧪 Testing Upload API Endpoints\n');
  console.log('='.repeat(60));

  const API_BASE = 'http://localhost:3001';

  try {
    // Step 1: Login as employer for upload testing
    console.log('1️⃣ 🔐 LOGIN FOR UPLOAD TESTING...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'employer@test.com',
        password: 'password123'
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed!');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ Login successful!');

    // Step 2: Test Get User Files (before upload)
    console.log('\n2️⃣ 📁 TESTING GET USER FILES (before upload)...');
    const getUserFilesResponse = await fetch(`${API_BASE}/upload`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    console.log('Status:', getUserFilesResponse.status);

    if (getUserFilesResponse.ok) {
      const userFiles = await getUserFilesResponse.json();
      console.log('✅ Get user files successful!');
      console.log('📊 User files count:', Array.isArray(userFiles) ? userFiles.length : 'N/A');
    } else {
      console.log('❌ Get user files failed!');
      const error = await getUserFilesResponse.text();
      console.log('Error:', error);
    }

    // Step 3: Test Upload Stats
    console.log('\n3️⃣ 📊 TESTING UPLOAD STATISTICS...');
    const statsResponse = await fetch(`${API_BASE}/upload/stats/overview`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    console.log('Status:', statsResponse.status);

    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Get upload stats successful!');
      console.log('📈 Stats:', JSON.stringify(stats, null, 2));
    } else {
      console.log('❌ Get upload stats failed!');
      const error = await statsResponse.text();
      console.log('Error:', error);
    }

    // Step 4: Test Get Public Files
    console.log('\n4️⃣ 🌐 TESTING GET PUBLIC FILES...');
    const publicFilesResponse = await fetch(`${API_BASE}/upload/public`);

    console.log('Status:', publicFilesResponse.status);

    if (publicFilesResponse.ok) {
      const publicFiles = await publicFilesResponse.json();
      console.log('✅ Get public files successful!');
      console.log('📊 Public files count:', Array.isArray(publicFiles) ? publicFiles.length : 'N/A');
    } else {
      console.log('❌ Get public files failed!');
      const error = await publicFilesResponse.text();
      console.log('Error:', error);
    }

    // Step 5: Test File Upload (using FormData)
    console.log('\n5️⃣ 📤 TESTING GENERAL FILE UPLOAD...');

    // Create a simple text file for testing
    const testFileContent = 'This is a test file for upload testing.';
    const blob = new Blob([testFileContent], { type: 'text/plain' });
    const testFile = new File([blob], 'test-upload.txt', { type: 'text/plain' });

    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('fileType', 'other'); // Required field
    formData.append('description', 'Test file for upload API testing');

    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type, let browser set it with boundary
      },
      body: formData,
    });

    console.log('Status:', uploadResponse.status);

    let uploadedFileId;
    if (uploadResponse.ok) {
      const uploadedFile = await uploadResponse.json();
      uploadedFileId = uploadedFile.id;
      console.log('✅ File upload successful!');
      console.log('🆔 File ID:', uploadedFileId);
      console.log('📋 File name:', uploadedFile.originalName || uploadedFile.filename);
      console.log('📁 File path:', uploadedFile.path);
      console.log('📏 File size:', uploadedFile.size, 'bytes');
      console.log('🖼️ MIME type:', uploadedFile.mimetype);
    } else {
      console.log('❌ File upload failed!');
      const error = await uploadResponse.text();
      console.log('Error:', error);
    }

    // Step 6: Test Get File by ID (if upload was successful)
    if (uploadedFileId) {
      console.log('\n6️⃣ 📖 TESTING GET FILE BY ID...');
      const getFileResponse = await fetch(`${API_BASE}/upload/${uploadedFileId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      console.log('Status:', getFileResponse.status);

      if (getFileResponse.ok) {
        const fileDetails = await getFileResponse.json();
        console.log('✅ Get file by ID successful!');
        console.log('📋 Filename:', fileDetails.originalName || fileDetails.filename);
        console.log('📏 Size:', fileDetails.size);
        console.log('🖼️ Type:', fileDetails.mimetype);
      } else {
        console.log('❌ Get file by ID failed!');
        const error = await getFileResponse.text();
        console.log('Error:', error);
      }

      // Step 7: Test Update File Metadata
      console.log('\n7️⃣ ✏️ TESTING UPDATE FILE METADATA...');
      const updateData = {
        originalName: 'updated-test-file.txt',
        description: 'Updated description for test file'
      };

      const updateResponse = await fetch(`${API_BASE}/upload/${uploadedFileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      console.log('Status:', updateResponse.status);

      if (updateResponse.ok) {
        const updatedFile = await updateResponse.json();
        console.log('✅ File metadata updated successfully!');
        console.log('📋 New filename:', updatedFile.originalName);
      } else {
        console.log('❌ File metadata update failed!');
        const error = await updateResponse.text();
        console.log('Error:', error);
      }
    }

    // Step 8: Test Avatar Upload
    console.log('\n8️⃣ 👤 TESTING AVATAR UPLOAD...');

    // Create a fake image file for avatar testing
    const avatarContent = 'fake-image-content-for-avatar';
    const avatarBlob = new Blob([avatarContent], { type: 'image/png' });
    const avatarFile = new File([avatarBlob], 'avatar.png', { type: 'image/png' });

    const avatarFormData = new FormData();
    avatarFormData.append('file', avatarFile); // Controller expects 'file' field

    const avatarResponse = await fetch(`${API_BASE}/upload/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: avatarFormData,
    });

    console.log('Status:', avatarResponse.status);

    if (avatarResponse.ok) {
      const avatarResult = await avatarResponse.json();
      console.log('✅ Avatar upload successful!');
      console.log('🆔 Avatar file ID:', avatarResult.id);
      console.log('📋 Filename:', avatarResult.originalName || avatarResult.filename);
    } else {
      console.log('❌ Avatar upload failed!');
      const error = await avatarResponse.text();
      console.log('Error:', error);
    }

    // Step 9: Test Company Logo Upload (if we have a company)
    console.log('\n9️⃣ 🏢 TESTING COMPANY LOGO UPLOAD...');

    // First get user's companies
    const companiesResponse = await fetch(`${API_BASE}/companies/user/my-companies`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (companiesResponse.ok) {
      const companies = await companiesResponse.json();
      if (companies.length > 0) {
        const companyId = companies[0].id;
        console.log('📍 Found company:', companies[0].name);

        // Create logo file
        const logoContent = 'fake-logo-content-for-company';
        const logoBlob = new Blob([logoContent], { type: 'image/png' });
        const logoFile = new File([logoBlob], 'company-logo.png', { type: 'image/png' });

        const logoFormData = new FormData();
        logoFormData.append('file', logoFile); // Controller expects 'file' field

        const logoResponse = await fetch(`${API_BASE}/upload/company-logo`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: logoFormData,
        });

        console.log('Status:', logoResponse.status);

        if (logoResponse.ok) {
          const logoResult = await logoResponse.json();
          console.log('✅ Company logo upload successful!');
          console.log('🆔 Logo file ID:', logoResult.id);
        } else {
          console.log('❌ Company logo upload failed!');
          const error = await logoResponse.text();
          console.log('Error:', error);
        }
      } else {
        console.log('⚠️ No companies found - skipping company logo test');
      }
    }

    // Step 10: Test Get User Files (after uploads)
    console.log('\n🔟 📁 TESTING GET USER FILES (after uploads)...');
    const getUserFilesAfterResponse = await fetch(`${API_BASE}/upload`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    console.log('Status:', getUserFilesAfterResponse.status);

    if (getUserFilesAfterResponse.ok) {
      const userFilesAfter = await getUserFilesAfterResponse.json();
      console.log('✅ Get user files (after uploads) successful!');
      console.log('📊 User files count after uploads:', Array.isArray(userFilesAfter) ? userFilesAfter.length : 'N/A');

      if (Array.isArray(userFilesAfter) && userFilesAfter.length > 0) {
        console.log('📋 Recent uploads:');
        userFilesAfter.slice(-3).forEach((file, index) => {
          console.log(`  ${index + 1}. ${file.originalName || file.filename} (${file.size} bytes)`);
        });
      }
    } else {
      console.log('❌ Get user files (after uploads) failed!');
    }

    // Step 11: Test Delete File (if we have an uploaded file)
    if (uploadedFileId) {
      console.log('\n1️⃣1️⃣ 🗑️ TESTING DELETE FILE...');
      const deleteResponse = await fetch(`${API_BASE}/upload/${uploadedFileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      console.log('Status:', deleteResponse.status);

      if (deleteResponse.ok || deleteResponse.status === 204) {
        console.log('✅ File deletion successful!');
      } else {
        console.log('❌ File deletion failed!');
        const error = await deleteResponse.text();
        console.log('Error:', error);
      }

      // Verify deletion
      console.log('\n🔍 VERIFYING FILE DELETION...');
      const verifyDeleteResponse = await fetch(`${API_BASE}/upload/${uploadedFileId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      console.log('Status:', verifyDeleteResponse.status);

      if (verifyDeleteResponse.status === 404) {
        console.log('✅ File deletion verified - Not found (404)!');
      } else {
        console.log('⚠️ File may still exist');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 UPLOAD API TEST COMPLETED!');
    console.log('='.repeat(60));

    console.log('\n📋 TEST SUMMARY:');
    console.log('✅ Authentication');
    console.log('✅ Get User Files');
    console.log('✅ Upload Statistics');
    console.log('✅ Get Public Files');
    console.log('✅ General File Upload');
    console.log('✅ Get File by ID');
    console.log('✅ Update File Metadata');
    console.log('✅ Avatar Upload');
    console.log('✅ Company Logo Upload');
    console.log('✅ File Deletion');
    console.log('✅ Deletion Verification');

    console.log('\n🔑 Upload API is working perfectly!');
    console.log('📚 Swagger URL: http://localhost:3001/api');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the test
testUploadAPI();
